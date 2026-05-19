import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
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
import { ConfigService } from '@nestjs/config';
import { S3Service } from '@/common/s3/s3.service';
import { QueueService } from '@/queue/queue.service';
import 'multer-s3';

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
        private readonly s3Service: S3Service,
        private readonly queueService: QueueService,
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
                imageUrl: (image as Express.MulterS3.File).location,
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

        await this.s3Service.deleteObject(blog.imageUrl);
        blog.imageUrl = (image as Express.MulterS3.File).location;

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
            await this.s3Service.deleteObject(blog.imageUrl);
            blog.imageUrl = (image as Express.MulterS3.File).location;
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

        if (blog.published) {
            throw new BadRequestException('Blog is already published');
        }

        blog.published = true;
        return this.toPublicBlog(await this.blogsRepository.save(blog));
    }

    async unpublishBlog(blogID: string, authorID: string, role?: string): Promise<BlogDto> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['author'],
        });
        if (!blog) throw new NotFoundException('Blog not found');
        if (role !== 'ADMIN') this.assertAuthor(blog.author.userID, authorID);

        if (!blog.published) {
            throw new BadRequestException('Blog is already unpublished');
        }
        blog.published = false;
        blog.approved = false;
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

        const appUrl = this.configService.getOrThrow<string>('APP_URL');
        this.queueService.publishBlogApproved({
            authorEmail: blog.author.email,
            authorName: blog.author.name,
            blogTitle: blog.title,
            blogUrl: `${appUrl}/blogs/${blogID}`,
        });

        return this.toPublicBlog(saved);
    }

    async deleteBlog(blogID: string, authorID: string, role?: string): Promise<void> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['author'],
        });
        if (!blog) throw new NotFoundException('Blog not found');
        if (role !== 'ADMIN') this.assertAuthor(blog.author.userID, authorID);

        await this.s3Service.deleteObject(blog.imageUrl);
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
