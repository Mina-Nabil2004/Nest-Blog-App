import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
    private readonly logger = new Logger(S3Service.name);
    private readonly s3: S3Client;
    private readonly bucket: string;

    constructor(private readonly configService: ConfigService) {
        this.s3 = new S3Client({
            region: configService.getOrThrow<string>('AWS_REGION'),
            credentials: {
                accessKeyId:
                    configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: configService.getOrThrow<string>(
                    'AWS_SECRET_ACCESS_KEY',
                ),
            },
        });
        this.bucket = configService.getOrThrow<string>('AWS_S3_BUCKET');
    }

    getStorage(folder: string) {
        return multerS3({
            s3: this.s3,
            bucket: this.bucket,
            key: (_req, file, cb) =>
                cb(null, `${folder}/${uuid()}${extname(file.originalname)}`),
        });
    }

    async deleteObject(imageUrl: string | null | undefined): Promise<void> {
        if (!imageUrl) return;
        try {
            const key = new URL(imageUrl).pathname.slice(1);
            await this.s3.send(
                new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
            );
            this.logger.log(`Deleted S3 object: ${key}`);
        } catch {
            this.logger.error(`Failed to delete S3 object: ${imageUrl}`);
        }
    }
}
