import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

export const blogImageMulterConfig = {
    storage: diskStorage({
        destination: './uploads/blogs',
        filename: (_req, file, cb) => {
            cb(null, uuid() + extname(file.originalname));
        },
    }),
};

export const userAvatarMulterConfig = {
    storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, cb) => {
            cb(null, uuid() + extname(file.originalname));
        },
    }),
};
