import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';
import { Tag } from '@/tags/entities/tag.entity';
import { BlogDto } from './dto/blog.dto';
import { TagDto } from '@/tags/dto/tag.dto';
import { CommentDto } from '@/comments/dto/comment.dto';

@Injectable()
export class BlogsService {
    constructor(
        @InjectRepository(Blog)
        private readonly blogsRepository: Repository<Blog>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Tag)
        private readonly tagsRepository: Repository<Tag>,
    ) {}

    async createBlog(createBlogDto: CreateBlogDto): Promise<BlogDto> {
        const author = await this.usersRepository.findOneBy({
            userID: createBlogDto.authorID,
        });
        if (!author) {
            throw new NotFoundException('Author not found');
        }
        const blog = this.blogsRepository.create({
            ...createBlogDto,
            author,
        });
        return this.blogsRepository.save(blog);
    }

    async getAllBlogs(): Promise<BlogDto[]> {
        return this.blogsRepository.find();
    }

    async getBlogById(blogID: string): Promise<BlogDto> {
        const blog = await this.blogsRepository.findOneBy({ blogID });
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }
        return blog;
    }

    async getPublishedBlogs(): Promise<BlogDto[]> {
        return this.blogsRepository.find({ where: { published: true } });
    }

    async getBlogsByAuthor(authorID: string): Promise<BlogDto[]> {
        const user = await this.usersRepository.findOne({
            where: { userID: authorID },
            relations: ['blogs'],
        });
        if (!user) {
            throw new NotFoundException('Author not found');
        }
        return user.blogs;
    }

    async updateBlog(
        blogID: string,
        updateBlogDto: UpdateBlogDto,
    ): Promise<BlogDto> {
        const blog = await this.blogsRepository.findOneBy({ blogID });
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }
        Object.assign(blog, updateBlogDto);
        return this.blogsRepository.save(blog);
    }

    async publishBlog(blogID: string, authorID: string): Promise<BlogDto> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['author'],
        });
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }
        if (blog.author.userID !== authorID) {
            throw new ForbiddenException('You are not the author of this blog');
        }
        if (blog.published) {
            throw new BadRequestException('Blog is already published');
        }
        blog.published = true;
        return this.blogsRepository.save(blog);
    }

    async unpublishBlog(blogID: string, authorID: string): Promise<BlogDto> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['author'],
        });
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }
        if (blog.author.userID !== authorID) {
            throw new ForbiddenException('You are not the author of this blog');
        }
        if (!blog.published) {
            throw new BadRequestException('Blog is already unpublished');
        }
        blog.published = false;
        return this.blogsRepository.save(blog);
    }

    async deleteBlog(blogID: string, authorID: string): Promise<void> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['author'],
        });
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }
        if (blog.author.userID !== authorID) {
            throw new ForbiddenException('You are not the author of this blog');
        }
        await this.blogsRepository.remove(blog);
    }

    async getBlogTags(blogID: string): Promise<TagDto[]> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['tags'],
        });
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }
        return blog.tags;
    }

    async addTagToBlog(blogID: string, tagID: string): Promise<void> {
        const blog = await this.blogsRepository.findOne({
            where: { blogID },
            relations: ['tags'],
        });
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }
        const tag = await this.tagsRepository.findOneBy({ tagID });
        if (!tag) {
            throw new NotFoundException('Tag not found');
        }
        const alreadyAssigned = blog.tags.some((t) => t.tagID === tagID);
        if (alreadyAssigned) {
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
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }
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
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }
        return blog.comments;
    }
}
