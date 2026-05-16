import { PipeTransform, BadRequestException, Injectable } from '@nestjs/common';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

@Injectable()
export class ImageValidationPipe implements PipeTransform {
    constructor(private readonly required = true) {}

    transform(
        file: Express.Multer.File | undefined,
    ): Express.Multer.File | undefined {
        if (!file) {
            if (this.required) {
                throw new BadRequestException('Image file is required');
            }
            return undefined;
        }

        if (
            !ALLOWED_MIME_TYPES.includes(
                file.mimetype as (typeof ALLOWED_MIME_TYPES)[number],
            )
        ) {
            throw new BadRequestException(
                `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            throw new BadRequestException(
                'File too large. Maximum size is 5 MB',
            );
        }

        return file;
    }
}
