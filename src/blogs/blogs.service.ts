import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import fs from 'fs';
import path from 'path';
import { Logger } from '@nestjs/common';

import { Blog } from './entities/blog.entity';
import { User } from '../users/entities/user.entity';
import { Tag } from '../tags/entities/tag.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogDto } from './dto/blog.dto';
import { TagDto } from '../tags/dto/tag.dto';
import { Comment } from '@/comments/entities/comment.entity';
import { CommentDto } from '../comments/dto/comment.dto';
import { MailService } from '@/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlogsService {
    private readonly logger = new Logger(BlogsService.name);
    constructor(
        @InjectRepository(Blog)
        private readonly blogsRepository: Repository<Blog>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Tag)
        private readonly tagsRepository: Repository<Tag>,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
    ) {}

    async createBlog(
        authorID: string,
        createBlogDto: CreateBlogDto,
        image?: Express.Multer.File,
    ): Promise<BlogDto> {
        const author = await this.usersRepository.findOneBy({
            userID: authorID,
        });
        if (!author) throw new NotFoundException('Author not found');

        const blog = this.blogsRepository.create({
            ...createBlogDto,
            author,
            ...(image && {
                imageUrl: this.buildImageUrl('blogs', image.filename),
            }),
        });

        return this.toPublicBlog(await this.blogsRepository.save(blog));
    }

    async uploadBlogImage(
        authorID: string,
        blogID: string,
        image: Express.Multer.File,
    ): Promise<BlogDto> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
        });
        if (!blog) throw new NotFoundException('Blog not found');
        this.assertAuthor(blog.author.userID, authorID);

        this.deleteLocalFile(blog.imageUrl);
        blog.imageUrl = this.buildImageUrl('blogs', image.filename);

        return this.toPublicBlog(await this.blogsRepository.save(blog));
    }

    async getAllBlogs(): Promise<BlogDto[]> {
        return (await this.blogsRepository.find()).map((blog) =>
            this.toPublicBlog(blog),
        );
    }

    async getBlogById(blogID: string): Promise<BlogDto> {
        const blog = await this.blogsRepository.findOneBy({ blogID });
        if (!blog) throw new NotFoundException('Blog not found');
        return this.toPublicBlog(blog);
    }

    async getPublishedBlogs(): Promise<BlogDto[]> {
        return (
            await this.blogsRepository.find({ where: { published: true } })
        ).map((blog) => this.toPublicBlog(blog));
    }

    async getBlogsByAuthor(authorID: string): Promise<BlogDto[]> {
        const user = await this.usersRepository.findOne({
            where: { userID: authorID },
            relations: ['blogs'],
        });
        if (!user) throw new NotFoundException('Author not found');
        return user.blogs.map((blog) => this.toPublicBlog(blog));
    }

    async updateBlog(
        authorID: string,
        blogID: string,
        updateBlogDto: UpdateBlogDto,
        image?: Express.Multer.File,
    ): Promise<BlogDto> {
        const blog = await this.blogsRepository.findOneBy({ blogID });
        if (!blog) throw new NotFoundException('Blog not found');
        this.assertAuthor(blog.author.userID, authorID);

        if (image) {
            this.deleteLocalFile(blog.imageUrl);
            blog.imageUrl = this.buildImageUrl('blogs', image.filename);
        }

        Object.assign(blog, updateBlogDto);
        return this.toPublicBlog(await this.blogsRepository.save(blog));
    }

    async publishBlog(blogID: string, authorID: string): Promise<BlogDto> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['author'],
        });
        if (!blog) throw new NotFoundException('Blog not found');
        this.assertAuthor(blog.author.userID, authorID);

        if (!blog.approved) {
            throw new BadRequestException(
                'Blog must be approved by an admin before publishing',
            );
        }
        if (blog.published) {
            throw new BadRequestException('Blog is already published');
        }

        blog.published = true;
        return this.toPublicBlog(await this.blogsRepository.save(blog));
    }

    async unpublishBlog(blogID: string, authorID: string): Promise<BlogDto> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['author'],
        });
        if (!blog) throw new NotFoundException('Blog not found');
        this.assertAuthor(blog.author.userID, authorID);

        if (!blog.published) {
            throw new BadRequestException('Blog is already unpublished');
        }
        blog.published = false;
        return this.toPublicBlog(await this.blogsRepository.save(blog));
    }

    async approveBlog(blogID: string): Promise<BlogDto> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['author'],
        });
        if (!blog) throw new NotFoundException('Blog not found');

        if (blog.approved) {
            throw new BadRequestException('Blog is already approved');
        }

        blog.approved = true;
        const saved = await this.blogsRepository.save(blog);

        // Notify the author — fire and forget, never throws
        const appUrl = this.configService.getOrThrow<string>('APP_URL');
        await this.mailService.sendEmail({
            to: blog.author.email,
            subject: 'Your blog post has been approved!',
            template: 'blog-approved',
            context: {
                authorName: blog.author.name,
                blogTitle: blog.title,
                blogUrl: `${appUrl}/blogs/${blogID}`,
            },
        });

        return this.toPublicBlog(saved);
    }

    async deleteBlog(blogID: string, authorID: string): Promise<void> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['author'],
        });
        if (!blog) throw new NotFoundException('Blog not found');
        this.assertAuthor(blog.author.userID, authorID);

        this.deleteLocalFile(blog.imageUrl);
        await this.blogsRepository.remove(blog);
    }

    async getBlogTags(blogID: string): Promise<TagDto[]> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['tags'],
        });
        if (!blog) throw new NotFoundException('Blog not found');
        return blog.tags;
    }

    async addTagToBlog(blogID: string, tagID: string): Promise<void> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['tags'],
        });
        if (!blog) throw new NotFoundException('Blog not found');

        const tag = await this.tagsRepository.findOneBy({ tagID });
        if (!tag) throw new NotFoundException('Tag not found');

        if (blog.tags.some((t) => t.tagID === tagID)) {
            throw new BadRequestException('Tag already added to this blog');
        }
        blog.tags.push(tag);
        await this.blogsRepository.save(blog);
    }

    async removeTagFromBlog(blogID: string, tagID: string): Promise<void> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['tags'],
        });
        if (!blog) throw new NotFoundException('Blog not found');

        const tagIndex = blog.tags.findIndex((t) => t.tagID === tagID);
        if (tagIndex === -1) {
            throw new NotFoundException('Tag not found in this blog');
        }
        blog.tags.splice(tagIndex, 1);
        await this.blogsRepository.save(blog);
    }

    async getBlogComments(blogID: string): Promise<CommentDto[]> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['comments'],
        });
        if (!blog) throw new NotFoundException('Blog not found');
        return blog.comments.map((comment) => this.toPublicComment(comment));
    }

    private assertAuthor(ownerID: string, requesterID: string): void {
        if (ownerID !== requesterID) {
            throw new ForbiddenException('You are not the author of this blog');
        }
    }

    private buildImageUrl(folder: string, filename: string): string {
        return `/uploads/${folder}/${filename}`;
    }

    private deleteLocalFile(imageUrl: string | null | undefined): void {
        if (!imageUrl) return;
        const filePath = path.join(process.cwd(), imageUrl);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                this.logger.log(`Deleted old image file: ${filePath}`);
            }
        } catch {
            this.logger.error(`Failed to delete file: ${filePath}`);
        }
    }

    private toPublicBlog(blog: Blog): BlogDto {
        const { author, ...rest } = blog;
        const { passwordHash, ...publicAuthor } = author;
        void passwordHash;
        return { ...rest, author: publicAuthor } as BlogDto;
    }

    private toPublicComment(comment: Comment): CommentDto {
        const { author, blog, ...rest } = comment;
        const { passwordHash, ...publicAuthor } = author;
        void passwordHash;
        return {
            ...rest,
            author: publicAuthor,
            blogID: blog.blogID,
        } as CommentDto;
    }
}
