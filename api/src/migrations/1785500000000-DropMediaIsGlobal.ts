import { MigrationInterface, QueryRunner } from "typeorm";

export class DropMediaIsGlobal1785500000000 implements MigrationInterface {
    name = 'DropMediaIsGlobal1785500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Single-store: media has no global/store distinction anymore.
        // Dropping the column also drops its index automatically in Postgres.
        await queryRunner.query(`ALTER TABLE "media" DROP COLUMN IF EXISTS "isGlobal"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "isGlobal" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_media_isGlobal" ON "media" ("isGlobal")`);
    }
}
