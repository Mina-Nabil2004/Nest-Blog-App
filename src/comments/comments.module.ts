import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { Blog } from '@/blogs/entities/blog.entity';
import { User } from '@/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Comment, Blog, User])],
    controllers: [CommentsController],
    providers: [CommentsService],
})
export class CommentsModule {}
