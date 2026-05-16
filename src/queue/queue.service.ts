import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BlogApprovedPayload } from './blog-approved.payload';

@Injectable()
export class QueueService {
    constructor(
        @Inject('BLOG_EVENTS_SERVICE')
        private readonly client: ClientProxy,
    ) {}

    publishBlogApproved(payload: BlogApprovedPayload): void {
        this.client.emit('blog.approved', payload);
    }
}
