import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Tag } from '../tags/entities/tag.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

config();

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [User, Blog, Comment, Tag, RefreshToken],
});

async function seed() {
    await dataSource.initialize();
    console.log('🌱 Seeding database...');

    // ------------------------------------------------------------------ cleanup
    await dataSource.query(`TRUNCATE TABLE "blog_tags_tag" CASCADE`);
    await dataSource.query(`TRUNCATE TABLE "comment" CASCADE`);
    await dataSource.query(`TRUNCATE TABLE "blog" CASCADE`);
    await dataSource.query(`TRUNCATE TABLE "tag" CASCADE`);
    await dataSource.query(`TRUNCATE TABLE "refresh_token" CASCADE`);
    await dataSource.query(`TRUNCATE TABLE "user" CASCADE`);
    console.log('🗑️  Cleared existing data');

    // ------------------------------------------------------------------ users
    const userRepo = dataSource.getRepository(User);

    const admin = userRepo.create({
        name: 'Admin User',
        email: 'admin@blog.com',
        passwordHash: await bcrypt.hash('adminpass123', 10),
        role: 'ADMIN',
    });

    const alice = userRepo.create({
        name: 'Alice Johnson',
        email: 'alice@blog.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'BASIC',
    });

    const bob = userRepo.create({
        name: 'Bob Smith',
        email: 'bob@blog.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'BASIC',
    });

    await userRepo.save([admin, alice, bob]);
    console.log('👤 Created users: admin, alice, bob');

    // ------------------------------------------------------------------ tags
    const tagRepo = dataSource.getRepository(Tag);

    const [tagTS, tagNode, tagDB, tagAuth, tagAPI] = await tagRepo.save([
        tagRepo.create({ name: 'TypeScript' }),
        tagRepo.create({ name: 'Node.js' }),
        tagRepo.create({ name: 'Database' }),
        tagRepo.create({ name: 'Auth' }),
        tagRepo.create({ name: 'REST API' }),
    ]);

    console.log(
        '🏷️  Created tags: TypeScript, Node.js, Database, Auth, REST API',
    );

    // ------------------------------------------------------------------ blogs
    const blogRepo = dataSource.getRepository(Blog);

    const blog1 = blogRepo.create({
        title: 'Getting Started with TypeScript',
        content:
            'TypeScript is a strongly typed superset of JavaScript. In this post we cover the basics: types, interfaces, generics, and how to set up a TypeScript project from scratch.',
        author: alice,
        published: true,
        tags: [tagTS],
    });

    const blog2 = blogRepo.create({
        title: 'Building REST APIs with Node.js and Express',
        content:
            'Express is the most popular Node.js framework. We walk through setting up routes, middleware, error handling, and how to structure a scalable project.',
        author: alice,
        published: true,
        tags: [tagNode, tagAPI],
    });

    const blog3 = blogRepo.create({
        title: 'PostgreSQL and TypeORM Deep Dive',
        content:
            'TypeORM makes database access easy with auto-generated types and a great developer experience. We explore schema design, migrations, relations, and seeding.',
        author: bob,
        published: true,
        tags: [tagDB, tagNode],
    });

    const blog4 = blogRepo.create({
        title: 'JWT Authentication from Scratch',
        content:
            'JSON Web Tokens allow stateless authentication. This post covers signing, verifying, refresh tokens, and best practices for securing your API.',
        author: bob,
        published: false,
        tags: [tagAuth, tagAPI],
    });

    const blog5 = blogRepo.create({
        title: 'Admin Guide: Managing the Blog Platform',
        content:
            'An internal guide for administrators covering user management, role assignment, content moderation, and platform maintenance.',
        author: admin,
        published: false,
        tags: [tagAuth],
    });

    await blogRepo.save([blog1, blog2, blog3, blog4, blog5]);
    console.log('📝 Created 5 blogs (3 published, 2 drafts)');

    // ------------------------------------------------------------------ comments
    const commentRepo = dataSource.getRepository(Comment);

    await commentRepo.save([
        commentRepo.create({
            content:
                'Great intro! Really helped me understand TypeScript basics.',
            author: bob,
            blog: blog1,
        }),
        commentRepo.create({
            content:
                'Could you cover generics in more depth in a follow-up post?',
            author: admin,
            blog: blog1,
        }),
        commentRepo.create({
            content:
                'This is exactly what I needed for my Node project, thank you!',
            author: bob,
            blog: blog2,
        }),
        commentRepo.create({
            content: 'How do you handle file uploads in Express 5?',
            author: alice,
            blog: blog2,
        }),
        commentRepo.create({
            content:
                'TypeORM query builder is a game changer for complex queries.',
            author: alice,
            blog: blog3,
        }),
        commentRepo.create({
            content: 'Do you have an example with many-to-many relations?',
            author: admin,
            blog: blog3,
        }),
    ]);

    console.log('💬 Created 6 comments');

    // ------------------------------------------------------------------ summary
    console.log('\n✅ Seeding complete!');
    console.log('\n📋 Test credentials:');
    console.log('   Admin  → email: admin@blog.com  | password: adminpass123');
    console.log('   Alice  → email: alice@blog.com  | password: password123');
    console.log('   Bob    → email: bob@blog.com    | password: password123');

    await dataSource.destroy();
}

seed().catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
});
