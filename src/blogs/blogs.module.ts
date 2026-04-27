import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { Blog } from './entities/blog.entity';
import { User } from '../users/entities/user.entity';
import { Tag } from '../tags/entities/tag.entity';
import { BlogSubscriber } from './blogs.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([Blog, User, Tag])],
    controllers: [BlogsController],
    providers: [BlogsService, BlogSubscriber],
})
export class BlogsModule {}
