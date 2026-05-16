import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm';
import { Logger } from '@nestjs/common';
import { RefreshToken } from './entities/refresh-token.entity';

@EventSubscriber()
export class RefreshTokenSubscriber implements EntitySubscriberInterface<RefreshToken> {
    private readonly logger = new Logger(RefreshTokenSubscriber.name);

    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo(): typeof RefreshToken {
        return RefreshToken;
    }

    afterInsert(event: InsertEvent<RefreshToken>): void {
        this.logger.log(`Refresh token issued: ${event.entity.tokenID}`);
    }

    afterUpdate(event: UpdateEvent<RefreshToken>): void {
        if (event.entity?.isRevoked) {
            this.logger.warn(`Refresh token revoked: ${event.entity.tokenID}`);
        }
    }

    afterRemove(event: RemoveEvent<RefreshToken>): void {
        this.logger.log(`Refresh token deleted: ${event.entityId}`);
    }
}
