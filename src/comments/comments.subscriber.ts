import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
} from 'typeorm';
import { Logger } from '@nestjs/common';
import { Comment } from './entities/comment.entity';

@EventSubscriber()
export class CommentSubscriber implements EntitySubscriberInterface<Comment> {
    private readonly logger = new Logger(CommentSubscriber.name);

    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo(): typeof Comment {
        return Comment;
    }

    afterInsert(event: InsertEvent<Comment>): void {
        this.logger.log(`Comment created: ${event.entity.commentID}`);
    }

    afterRemove(event: RemoveEvent<Comment>): void {
        this.logger.log(`Comment deleted: ${event.entityId}`);
    }
}
