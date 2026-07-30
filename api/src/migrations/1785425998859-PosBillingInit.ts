import { MigrationInterface, QueryRunner } from "typeorm";

export class PosBillingInit1785425998859 implements MigrationInterface {
    name = 'PosBillingInit1785425998859';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- couriers table (non-login delivery records) ---
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "couriers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "phone" character varying,
                "company" character varying,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_couriers_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_couriers_isActive" ON "couriers" ("isActive")`);

        // --- customers: relax email, add city (walk-in support) ---
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "city" character varying`);

        // --- orders: POS / omnichannel fields ---
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."orders_salechannel_enum" AS ENUM('online', 'offline');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "saleChannel" "public"."orders_salechannel_enum" NOT NULL DEFAULT 'online'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "posOperatorId" uuid`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "courierId" uuid`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customerName" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customerPhone" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customerCity" character varying`);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_saleChannel" ON "orders" ("saleChannel")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_posOperatorId" ON "orders" ("posOperatorId")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_courierId" ON "orders" ("courierId")`);

        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_courier"
                    FOREIGN KEY ("courierId") REFERENCES "couriers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_orders_courier"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_orders_courierId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_orders_posOperatorId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_orders_saleChannel"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "customerCity"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "customerPhone"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "customerName"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "courierId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "posOperatorId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "saleChannel"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."orders_salechannel_enum"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN IF EXISTS "city"`);
        // NOTE: customers.email left nullable on rollback (re-adding NOT NULL could fail on existing NULLs)
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_couriers_isActive"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "couriers"`);
    }

}
