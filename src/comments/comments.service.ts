import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Comment } from './entities/comment.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentsRepository: Repository<Comment>,
        @InjectRepository(Blog)
        private readonly blogsRepository: Repository<Blog>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async createComment(
        authorID: string,
        createCommentDto: CreateCommentDto,
    ): Promise<CommentDto> {
        const author = await this.usersRepository.findOneBy({
            userID: authorID,
        });
        if (!author) throw new NotFoundException('Author not found');

        const blog = await this.blogsRepository.findOneBy({
            blogID: createCommentDto.blogID,
        });
        if (!blog) throw new NotFoundException('Blog not found');

        const comment = this.commentsRepository.create({
            content: createCommentDto.content,
            author,
            blog,
        });
        return this.toPublicComment(
            await this.commentsRepository.save(comment),
        );
    }

    async getAllComments(): Promise<CommentDto[]> {
        return (await this.commentsRepository.find()).map((comment) =>
            this.toPublicComment(comment),
        );
    }

    async getCommentById(commentID: string): Promise<CommentDto> {
        const comment = await this.commentsRepository.findOneBy({ commentID });
        if (!comment) throw new NotFoundException('Comment not found');
        return this.toPublicComment(comment);
    }

    async updateComment(
        commentID: string,
        updateCommentDto: UpdateCommentDto,
        authorID: string,
    ): Promise<CommentDto> {
        const comment = await this.commentsRepository.findOne({
            where: { commentID },
            relations: ['author'],
        });
        if (!comment) throw new NotFoundException('Comment not found');

        if (comment.author.userID !== authorID) {
            throw new ForbiddenException(
                'You can only update your own comments',
            );
        }
        Object.assign(comment, { content: updateCommentDto.content });
        return this.toPublicComment(
            await this.commentsRepository.save(comment),
        );
    }

    async deleteComment(commentID: string, authorID: string, role?: string): Promise<void> {
        const comment = await this.commentsRepository.findOne({
            where: { commentID },
            relations: ['author'],
        });
        if (!comment) throw new NotFoundException('Comment not found');

        if (role !== 'ADMIN' && comment.author.userID !== authorID) {
            throw new ForbiddenException(
                'You can only delete your own comments',
            );
        }
        await this.commentsRepository.remove(comment);
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
