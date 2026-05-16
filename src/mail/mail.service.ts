import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) {}

    async sendEmail(params: {
        to: string;
        subject: string;
        template: string;
        context: ISendMailOptions['context'];
    }): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: params.to,
                from: this.configService.getOrThrow<string>('SMTP_FROM'),
                subject: params.subject,
                template: params.template,
                context: params.context,
            });

            this.logger.log(`Email "${params.subject}" sent to ${params.to}`);
        } catch (error) {
            this.logger.error(
                `Failed to send email "${params.subject}" to ${params.to}`,
                error,
            );
        }
    }
}
