import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Comment } from './entities/comment.entity';
import { CommentDto } from './dto/comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '@/blogs/entities/blog.entity';
import { User } from '@/users/entities/user.entity';

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
        createCommentDto: CreateCommentDto,
    ): Promise<CommentDto> {
        const author = await this.usersRepository.findOneBy({
            userID: createCommentDto.authorID,
        });
        if (!author) {
            throw new NotFoundException('Author not found');
        }
        const blog = await this.blogsRepository.findOneBy({
            blogID: createCommentDto.blogID,
        });
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }
        const comment = this.commentsRepository.create({
            content: createCommentDto.content,
            author,
            blog,
        });
        return this.commentsRepository.save(comment);
    }

    async getAllComments(): Promise<CommentDto[]> {
        return this.commentsRepository.find();
    }

    async getCommentById(commentID: string): Promise<CommentDto> {
        const comment = await this.commentsRepository.findOneBy({ commentID });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        return comment;
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
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        if (comment.author.userID !== authorID) {
            throw new ForbiddenException(
                'You can only update your own comments',
            );
        }
        Object.assign(comment, { content: updateCommentDto.content });
        return this.commentsRepository.save(comment);
    }

    async deleteComment(commentID: string, authorID: string): Promise<void> {
        const comment = await this.commentsRepository.findOne({
            where: { commentID },
            relations: ['author'],
        });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        if (comment.author.userID !== authorID) {
            throw new ForbiddenException(
                'You can only delete your own comments',
            );
        }
        await this.commentsRepository.remove(comment);
    }
}
