import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
} from 'typeorm';
import { Logger } from '@nestjs/common';
import { User } from './entities/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
    private readonly logger = new Logger(UserSubscriber.name);

    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo(): typeof User {
        return User;
    }

    afterInsert(event: InsertEvent<User>): void {
        this.logger.log(`User created: ${event.entity.userID}`);
    }

    afterRemove(event: RemoveEvent<User>): void {
        this.logger.log(`User deleted: ${event.entityId}`);
    }
}
