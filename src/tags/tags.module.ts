import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from './entities/tag.entity';
import { TagSubscriber } from './tags.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([Tag])],
    controllers: [TagsController],
    providers: [TagsService, TagSubscriber],
})
export class TagsModule {}
