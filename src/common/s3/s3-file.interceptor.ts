import {
    CallHandler,
    ExecutionContext,
    Injectable,
    mixin,
    NestInterceptor,
} from '@nestjs/common';
import multer from 'multer';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { S3Service } from './s3.service';

export function S3FileInterceptor(fieldName: string, folder: string) {
    @Injectable()
    class S3FileInterceptorClass implements NestInterceptor {
        constructor(public readonly s3Service: S3Service) {}

        async intercept(
            context: ExecutionContext,
            next: CallHandler,
        ): Promise<Observable<unknown>> {
            const ctx = context.switchToHttp();
            const req = ctx.getRequest<Request>();
            const res = ctx.getResponse<Response>();

            await new Promise<void>((resolve, reject) => {
                multer({ storage: this.s3Service.getStorage(folder) }).single(
                    fieldName,
                )(req, res, (err) => {
                    if (err) reject(err as Error);
                    else resolve();
                });
            });

            return next.handle();
        }
    }

    return mixin(S3FileInterceptorClass);
}
