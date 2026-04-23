import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';
import { Blog } from './src/blogs/entities/blog.entity';
import { Comment } from './src/comments/entities/comment.entity';
import { Tag } from './src/tags/entities/tag.entity';
import { RefreshToken } from './src/auth/entities/refresh-token.entity';

config();

export default new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [User, Blog, Comment, Tag, RefreshToken],
    migrations: ['src/database/migrations/*.ts'],
});
