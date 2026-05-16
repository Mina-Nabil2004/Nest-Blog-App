import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApprovedColumnToBlog1776941234568 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "blog"
            ADD COLUMN "approved" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "blog"
            DROP COLUMN "approved"
        `);
    }
}
