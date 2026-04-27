import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1776939649040 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create user table
        await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('BASIC', 'ADMIN')
        `);

        await queryRunner.query(`
            CREATE TABLE "user" (
                "userID" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "passwordHash" character varying NOT NULL,
                "role" "public"."user_role_enum" NOT NULL DEFAULT 'BASIC',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_user_email" UNIQUE ("email"),
                CONSTRAINT "PK_user" PRIMARY KEY ("userID")
            )
        `);

        // Create tag table
        await queryRunner.query(`
            CREATE TABLE "tag" (
                "tagID" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                CONSTRAINT "PK_tag" PRIMARY KEY ("tagID")
            )
        `);

        // Create blog table
        await queryRunner.query(`
            CREATE TABLE "blog" (
                "blogID" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "content" text NOT NULL,
                "published" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "authorUserID" uuid,
                CONSTRAINT "PK_blog" PRIMARY KEY ("blogID")
            )
        `);

        // Create comment table
        await queryRunner.query(`
            CREATE TABLE "comment" (
                "commentID" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "content" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "authorUserID" uuid,
                "blogBlogID" uuid,
                CONSTRAINT "PK_comment" PRIMARY KEY ("commentID")
            )
        `);

        // Create refresh_token table
        await queryRunner.query(`
            CREATE TABLE "refresh_token" (
                "tokenID" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "tokenHash" character varying NOT NULL,
                "isRevoked" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "expiresAt" TIMESTAMP NOT NULL,
                "userUserID" uuid,
                CONSTRAINT "PK_refresh_token" PRIMARY KEY ("tokenID")
            )
        `);

        // Create blog_tags_tag join table
        await queryRunner.query(`
            CREATE TABLE "blog_tags_tag" (
                "blogBlogID" uuid NOT NULL,
                "tagTagID" uuid NOT NULL,
                CONSTRAINT "PK_blog_tags_tag" PRIMARY KEY ("blogBlogID", "tagTagID")
            )
        `);

        // Foreign keys
        await queryRunner.query(`
            ALTER TABLE "blog"
            ADD CONSTRAINT "FK_blog_author"
            FOREIGN KEY ("authorUserID") REFERENCES "user"("userID")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "comment"
            ADD CONSTRAINT "FK_comment_author"
            FOREIGN KEY ("authorUserID") REFERENCES "user"("userID")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "comment"
            ADD CONSTRAINT "FK_comment_blog"
            FOREIGN KEY ("blogBlogID") REFERENCES "blog"("blogID")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "refresh_token"
            ADD CONSTRAINT "FK_refresh_token_user"
            FOREIGN KEY ("userUserID") REFERENCES "user"("userID")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "blog_tags_tag"
            ADD CONSTRAINT "FK_blog_tags_tag_blog"
            FOREIGN KEY ("blogBlogID") REFERENCES "blog"("blogID")
            ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "blog_tags_tag"
            ADD CONSTRAINT "FK_blog_tags_tag_tag"
            FOREIGN KEY ("tagTagID") REFERENCES "tag"("tagID")
            ON DELETE CASCADE ON UPDATE CASCADE
        `);

        // Indexes
        await queryRunner.query(`
            CREATE INDEX "IDX_blog_tags_tag_blog" ON "blog_tags_tag" ("blogBlogID")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_blog_tags_tag_tag" ON "blog_tags_tag" ("tagTagID")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_blog_tags_tag_tag"`);
        await queryRunner.query(`DROP INDEX "IDX_blog_tags_tag_blog"`);
        await queryRunner.query(
            `ALTER TABLE "blog_tags_tag" DROP CONSTRAINT "FK_blog_tags_tag_tag"`,
        );
        await queryRunner.query(
            `ALTER TABLE "blog_tags_tag" DROP CONSTRAINT "FK_blog_tags_tag_blog"`,
        );
        await queryRunner.query(
            `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_refresh_token_user"`,
        );
        await queryRunner.query(
            `ALTER TABLE "comment" DROP CONSTRAINT "FK_comment_blog"`,
        );
        await queryRunner.query(
            `ALTER TABLE "comment" DROP CONSTRAINT "FK_comment_author"`,
        );
        await queryRunner.query(
            `ALTER TABLE "blog" DROP CONSTRAINT "FK_blog_author"`,
        );
        await queryRunner.query(`DROP TABLE "blog_tags_tag"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "blog"`);
        await queryRunner.query(`DROP TABLE "tag"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }
}
