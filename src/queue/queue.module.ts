import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MailModule } from '@/mail/mail.module';
import { QueueService } from './queue.service';
import { QueueConsumerController } from './queue-consumer.controller';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'BLOG_EVENTS_SERVICE',
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [
                            configService.getOrThrow<string>('RABBITMQ_URL'),
                        ],
                        queue: 'blog_events',
                        queueOptions: { durable: true },
                    },
                }),
            },
        ]),
        MailModule,
    ],
    controllers: [QueueConsumerController],
    providers: [QueueService],
    exports: [QueueService],
})
export class QueueModule {}
