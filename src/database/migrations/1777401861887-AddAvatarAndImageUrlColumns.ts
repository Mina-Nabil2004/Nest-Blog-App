import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarAndImageUrlColumns1776941234567 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add avatarUrl to user
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN "avatarUrl" character varying NULL
        `);

        // Add imageUrl to blog
        await queryRunner.query(`
            ALTER TABLE "blog"
            ADD COLUMN "imageUrl" character varying NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove imageUrl from blog
        await queryRunner.query(`
            ALTER TABLE "blog"
            DROP COLUMN "imageUrl"
        `);

        // Remove avatarUrl from user
        await queryRunner.query(`
            ALTER TABLE "user"
            DROP COLUMN "avatarUrl"
        `);
    }
}
