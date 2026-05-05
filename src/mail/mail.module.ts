import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

import { MailService } from './mail.service';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.getOrThrow<string>('SMTP_HOST'),
                    port: configService.getOrThrow<number>('SMTP_PORT'),
                    secure: false,
                    auth: {
                        user: configService.getOrThrow<string>('SMTP_USER'),
                        pass: configService.getOrThrow<string>('SMTP_PASS'),
                    },
                },
                defaults: {
                    from: configService.getOrThrow<string>('SMTP_FROM'),
                },
                template: {
                    dir: join(process.cwd(), 'src/templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
