import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MailService } from '@/mail/mail.service';
import { type BlogApprovedPayload } from './blog-approved.payload';

@Controller()
export class QueueConsumerController {
    constructor(private readonly mailService: MailService) {}

    @EventPattern('blog.approved')
    async handleBlogApproved(
        @Payload() data: BlogApprovedPayload,
    ): Promise<void> {
        await this.mailService.sendEmail({
            to: data.authorEmail,
            subject: 'Your blog post has been approved!',
            template: 'blog-approved',
            context: {
                authorName: data.authorName,
                blogTitle: data.blogTitle,
                blogUrl: data.blogUrl,
            },
        });
    }
}
