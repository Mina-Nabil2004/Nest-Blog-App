import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
} from 'typeorm';
import { Logger } from '@nestjs/common';
import { Blog } from './entities/blog.entity';

@EventSubscriber()
export class BlogSubscriber implements EntitySubscriberInterface<Blog> {
    private readonly logger = new Logger(BlogSubscriber.name);

    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo(): typeof Blog {
        return Blog;
    }

    afterInsert(event: InsertEvent<Blog>): void {
        this.logger.log(`Blog created: ${event.entity.blogID}`);
    }

    afterRemove(event: RemoveEvent<Blog>): void {
        this.logger.log(`Blog deleted: ${event.entityId}`);
    }
}
