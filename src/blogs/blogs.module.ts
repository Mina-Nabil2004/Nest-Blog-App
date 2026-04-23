import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { User } from '@/users/entities/user.entity';
import { Blog } from './entities/blog.entity';
import { Tag } from '@/tags/entities/tag.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Blog, User, Tag])],
    controllers: [BlogsController],
    providers: [BlogsService],
})
export class BlogsModule {}
