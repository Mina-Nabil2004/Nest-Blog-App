import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserSubscriber } from './users.subscriber';
import { S3Module } from '../common/s3/s3.module';

@Module({
    imports: [TypeOrmModule.forFeature([User]), S3Module],
    controllers: [UsersController],
    providers: [UsersService, UserSubscriber],
    exports: [UsersService],
})
export class UsersModule {}
