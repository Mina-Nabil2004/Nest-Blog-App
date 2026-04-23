import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
} from 'typeorm';
import { Logger } from '@nestjs/common';
import { Tag } from './entities/tag.entity';

@EventSubscriber()
export class TagSubscriber implements EntitySubscriberInterface<Tag> {
    private readonly logger = new Logger(TagSubscriber.name);

    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo(): typeof Tag {
        return Tag;
    }

    afterInsert(event: InsertEvent<Tag>): void {
        this.logger.log(`Tag created: ${event.entity.tagID}`);
    }

    afterRemove(event: RemoveEvent<Tag>): void {
        this.logger.log(`Tag deleted: ${event.entityId}`);
    }
}
