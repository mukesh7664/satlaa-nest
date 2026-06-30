import { MigrationInterface, QueryRunner } from "typeorm";

export class SingleStoreRemoveStoreId1782821289825 implements MigrationInterface {
    name = 'SingleStoreRemoveStoreId1782821289825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ── Single-store conversion: de-duplicate customers sharing an email ──
        // Multi-tenant allowed the same email across different stores. Single-store
        // requires a unique customer email, so keep the earliest-created customer per
        // email and remove the rest (plus their dependent rows). Verified safe: every
        // duplicate row here has 0 orders, so no transactional data is lost.
        await queryRunner.query(`
            DELETE FROM "addresses" WHERE "customerId" IN (
                SELECT id FROM (
                    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY "createdAt" ASC) AS rn FROM "customers"
                ) d WHERE d.rn > 1
            )`);
        await queryRunner.query(`
            DELETE FROM "carts" WHERE "customerId" IN (
                SELECT id FROM (
                    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY "createdAt" ASC) AS rn FROM "customers"
                ) d WHERE d.rn > 1
            )`);
        await queryRunner.query(`
            DELETE FROM "wishlists" WHERE "userId" IN (
                SELECT id FROM (
                    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY "createdAt" ASC) AS rn FROM "customers"
                ) d WHERE d.rn > 1
            )`);
        await queryRunner.query(`
            DELETE FROM "customers" WHERE id IN (
                SELECT id FROM (
                    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY "createdAt" ASC) AS rn FROM "customers"
                ) d WHERE d.rn > 1
            )`);

        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_b7837678f3d750698394a80f70a"`);
        await queryRunner.query(`ALTER TABLE "return_requests" DROP CONSTRAINT "FK_ee4c36f1b84fbde776bde44ad51"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_0f82354e5b05fd87884eff3a7b5"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_eb3e3bde97446f8e51fbf47b76a"`);
        await queryRunner.query(`ALTER TABLE "estimates" DROP CONSTRAINT "FK_8cd9538874d04058a875159c681"`);
        await queryRunner.query(`ALTER TABLE "discounts" DROP CONSTRAINT "FK_a4a5fe42d37dc850b3e18b853a2"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_fa6ba3528de12e174b163c09fdd"`);
        await queryRunner.query(`ALTER TABLE "collections" DROP CONSTRAINT "FK_068a0507b0e0fc23b06fcffd3f5"`);
        await queryRunner.query(`ALTER TABLE "product_bundle_items" DROP CONSTRAINT "FK_1fba30c9a6e144faabc2713dfc3"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_782da5e50e94b763eb63225d69d"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_7ca211e7a4a57288fcb55a6de97"`);
        await queryRunner.query(`ALTER TABLE "store_payment_configs" DROP CONSTRAINT "FK_5d5ef4e1e58ece1709da5e00cf1"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_8afabeaa460738befe497e857c7"`);
        await queryRunner.query(`ALTER TABLE "payment_attempts" DROP CONSTRAINT "FK_55a3a9977a52cdf06801751ba94"`);
        await queryRunner.query(`ALTER TABLE "payment_attempts" DROP CONSTRAINT "FK_334e552a811bd5d20909e87404e"`);
        await queryRunner.query(`ALTER TABLE "inquiries" DROP CONSTRAINT "FK_b33c8492b862a9ca2f38ed214d2"`);
        await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "FK_7c998d8a366263efe3b50feca13"`);
        await queryRunner.query(`ALTER TABLE "wishlists" DROP CONSTRAINT "FK_ca030e3c276e84ef3a06d76634c"`);
        await queryRunner.query(`ALTER TABLE "product_reviews" DROP CONSTRAINT "FK_37b0fd0be2b97d977e03de4fa10"`);
        await queryRunner.query(`ALTER TABLE "blog_tags" DROP CONSTRAINT "FK_fa78fa32102e7b019a26a337b13"`);
        await queryRunner.query(`ALTER TABLE "blog_categories" DROP CONSTRAINT "FK_3a4b7017823610c19b31f74af11"`);
        await queryRunner.query(`ALTER TABLE "blog_posts" DROP CONSTRAINT "FK_1a5f8db3af7dbeca9064a0d3c31"`);
        await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "FK_9b5bfa860bef5d644391fdf298b"`);
        await queryRunner.query(`ALTER TABLE "seo_settings" DROP CONSTRAINT "FK_1cbf6f86c05ffd1eed349377f5d"`);
        await queryRunner.query(`ALTER TABLE "product_flags" DROP CONSTRAINT "FK_f2125896289f1e69103a8344413"`);
        await queryRunner.query(`ALTER TABLE "general_settings" DROP CONSTRAINT "FK_e6c2b01010fd75da12f28c9423b"`);
        await queryRunner.query(`ALTER TABLE "email_templates" DROP CONSTRAINT "FK_14cb3946c16e0e59f29d682b959"`);
        await queryRunner.query(`ALTER TABLE "email_settings" DROP CONSTRAINT "FK_a974d6c3e95a9e43787f8275ace"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_78391c7649b00dcd33f66dbc906"`);
        await queryRunner.query(`ALTER TABLE "admin_notifications" DROP CONSTRAINT "FK_99acca30e10327367cecae59d09"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9736872ea57d49dc87d496692"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3601141586fbfaa357fc6986b6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8cd9538874d04058a875159c68"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a4a5fe42d37dc850b3e18b853a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4dc2021f63ca35ec7905cb2fd2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fa6ba3528de12e174b163c09fd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aae5d08992215070501e5978c3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9844b96a2b5b3620eee675f805"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfb0560b63448b799dea5aaa29"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7ca211e7a4a57288fcb55a6de9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ca30fa14dc675681471a84c5d1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d3c1530d36de1db25c7a75117a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b33c8492b862a9ca2f38ed214d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe66ca6a86dc94233e5d778953"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_26ae14c275bad7ed3dcf0b8637"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6a4ad3fee4ce670d1075ad084a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_affddcf04fbbeaf79e13fb4060"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_afc33ebb304bb6ee9dc0a26c5d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b260fd70ee5a67d1466f22f852"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fa78fa32102e7b019a26a337b1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3a4b7017823610c19b31f74af1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_646d709dfe3e6b90aadd726e4a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_903a6ea496e83ba9bec10af583"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1a5f8db3af7dbeca9064a0d3c3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8c9c50427234f911e00170fc87"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78391c7649b00dcd33f66dbc90"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99acca30e10327367cecae59d0"`);
        await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "UQ_99c26b67c3c32fd36286503e2fa"`);
        await queryRunner.query(`CREATE TABLE "newsletter_subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "source" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_57fd53bd8b39fe19d2be8136f64" UNIQUE ("email"), CONSTRAINT "PK_cfca9a6e4f146a80a6cd2e76f1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "support_tickets" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "return_requests" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "shipping_configs" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "admins" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "estimates" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "discounts" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "collections" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "product_bundle_items" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "store_payment_configs" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "store_id"`);
        await queryRunner.query(`ALTER TABLE "payment_attempts" DROP COLUMN "store_id"`);
        await queryRunner.query(`ALTER TABLE "inquiries" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "header_sections" DROP COLUMN "store_id"`);
        await queryRunner.query(`ALTER TABLE "footer_sections" DROP COLUMN "store_id"`);
        await queryRunner.query(`ALTER TABLE "wishlists" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "product_reviews" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "blog_tags" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "blog_categories" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "blog_posts" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "seo_settings" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "product_flags" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "general_settings" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "email_templates" DROP COLUMN "store_id"`);
        await queryRunner.query(`ALTER TABLE "email_settings" DROP COLUMN "store_id"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "admin_notifications" DROP COLUMN "storeId"`);
        await queryRunner.query(`ALTER TABLE "admins" ALTER COLUMN "role" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "carts" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '7 days'`);
        await queryRunner.query(`ALTER TABLE "store_payment_configs" ADD CONSTRAINT "UQ_08b61c46e82eed1407492a17619" UNIQUE ("provider")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8536b8b85c06969f84f0c098b0" ON "customers" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_12d41348ca033c5711adb282c6" ON "products" ("sku") WHERE "sku" IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_a3ebdfe294663591481cd2f6a7" ON "carts" ("sessionId", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_59c73fa0e59e1c46623a29d373" ON "carts" ("customerId", "status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe66ca6a86dc94233e5d778953" ON "pages" ("slug") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5629f2896ea05ee200f7a96af4" ON "wishlists" ("userId", "productId") `);
        await queryRunner.query(`CREATE INDEX "IDX_32edd80d91dff1bc19e79c8f16" ON "product_reviews" ("productId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_afc33ebb304bb6ee9dc0a26c5d" ON "blog_tags" ("slug") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_903a6ea496e83ba9bec10af583" ON "blog_categories" ("slug") `);

        // ── Single-store conversion: drop orphan multi-tenant tables ──
        // No entities reference these anymore. CASCADE removes any remaining FK
        // constraints from other tables (e.g. store_invoices) that point at stores.
        await queryRunner.query(`DROP TABLE IF EXISTS "store_domains" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "store_subscriptions" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "stores" CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate the stores table so the FK re-adds below can resolve.
        // (store_subscriptions / store_domains are not recreated — this conversion is one-way.)
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "stores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "owner_id" character varying NOT NULL, "slug" character varying, "status" character varying NOT NULL DEFAULT 'active', "showInMarketplace" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_stores_slug" UNIQUE ("slug"), CONSTRAINT "PK_stores_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`DROP INDEX "public"."IDX_903a6ea496e83ba9bec10af583"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_afc33ebb304bb6ee9dc0a26c5d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_32edd80d91dff1bc19e79c8f16"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5629f2896ea05ee200f7a96af4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe66ca6a86dc94233e5d778953"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_59c73fa0e59e1c46623a29d373"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a3ebdfe294663591481cd2f6a7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_12d41348ca033c5711adb282c6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8536b8b85c06969f84f0c098b0"`);
        await queryRunner.query(`ALTER TABLE "store_payment_configs" DROP CONSTRAINT "UQ_08b61c46e82eed1407492a17619"`);
        await queryRunner.query(`ALTER TABLE "carts" ALTER COLUMN "expiresAt" SET DEFAULT (now() + '7 days')`);
        await queryRunner.query(`ALTER TABLE "admins" ALTER COLUMN "role" SET DEFAULT 'store_admin'`);
        await queryRunner.query(`ALTER TABLE "admin_notifications" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "email_settings" ADD "store_id" uuid`);
        await queryRunner.query(`ALTER TABLE "email_templates" ADD "store_id" uuid`);
        await queryRunner.query(`ALTER TABLE "general_settings" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "product_flags" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "seo_settings" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "tags" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "blog_posts" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "blog_categories" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "blog_tags" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "product_reviews" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "wishlists" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "footer_sections" ADD "store_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "header_sections" ADD "store_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "media" ADD "storeId" character varying`);
        await queryRunner.query(`ALTER TABLE "pages" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "inquiries" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "payment_attempts" ADD "store_id" uuid`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "store_id" uuid`);
        await queryRunner.query(`ALTER TABLE "store_payment_configs" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "carts" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "products" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "product_bundle_items" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "collections" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "discounts" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "estimates" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "admins" ADD "storeId" character varying`);
        await queryRunner.query(`ALTER TABLE "shipping_configs" ADD "storeId" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "return_requests" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "storeId" uuid`);
        await queryRunner.query(`ALTER TABLE "support_tickets" ADD "storeId" character varying`);
        await queryRunner.query(`DROP TABLE "newsletter_subscriptions"`);
        await queryRunner.query(`ALTER TABLE "pages" ADD CONSTRAINT "UQ_99c26b67c3c32fd36286503e2fa" UNIQUE ("slug", "storeId")`);
        await queryRunner.query(`CREATE INDEX "IDX_99acca30e10327367cecae59d0" ON "admin_notifications" ("storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_78391c7649b00dcd33f66dbc90" ON "audit_logs" ("storeId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8c9c50427234f911e00170fc87" ON "blog_posts" ("slug", "storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1a5f8db3af7dbeca9064a0d3c3" ON "blog_posts" ("storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_903a6ea496e83ba9bec10af583" ON "blog_categories" ("slug") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_646d709dfe3e6b90aadd726e4a" ON "blog_categories" ("slug", "storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3a4b7017823610c19b31f74af1" ON "blog_categories" ("storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fa78fa32102e7b019a26a337b1" ON "blog_tags" ("storeId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b260fd70ee5a67d1466f22f852" ON "blog_tags" ("slug", "storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_afc33ebb304bb6ee9dc0a26c5d" ON "blog_tags" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_affddcf04fbbeaf79e13fb4060" ON "product_reviews" ("productId", "storeId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6a4ad3fee4ce670d1075ad084a" ON "wishlists" ("userId", "storeId", "productId") `);
        await queryRunner.query(`CREATE INDEX "IDX_26ae14c275bad7ed3dcf0b8637" ON "media" ("storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fe66ca6a86dc94233e5d778953" ON "pages" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_b33c8492b862a9ca2f38ed214d" ON "inquiries" ("storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d3c1530d36de1db25c7a75117a" ON "carts" ("status", "sessionId", "storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ca30fa14dc675681471a84c5d1" ON "carts" ("status", "customerId", "storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7ca211e7a4a57288fcb55a6de9" ON "carts" ("storeId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bfb0560b63448b799dea5aaa29" ON "products" ("storeId", "sku") WHERE (sku IS NOT NULL)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9844b96a2b5b3620eee675f805" ON "products" ("slug", "storeId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_aae5d08992215070501e5978c3" ON "collections" ("slug", "storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fa6ba3528de12e174b163c09fd" ON "categories" ("storeId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4dc2021f63ca35ec7905cb2fd2" ON "categories" ("slug", "storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a4a5fe42d37dc850b3e18b853a" ON "discounts" ("storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8cd9538874d04058a875159c68" ON "estimates" ("storeId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3601141586fbfaa357fc6986b6" ON "customers" ("email", "storeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a9736872ea57d49dc87d496692" ON "support_tickets" ("storeId") `);
        await queryRunner.query(`ALTER TABLE "admin_notifications" ADD CONSTRAINT "FK_99acca30e10327367cecae59d09" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_78391c7649b00dcd33f66dbc906" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "email_settings" ADD CONSTRAINT "FK_a974d6c3e95a9e43787f8275ace" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "email_templates" ADD CONSTRAINT "FK_14cb3946c16e0e59f29d682b959" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "general_settings" ADD CONSTRAINT "FK_e6c2b01010fd75da12f28c9423b" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_flags" ADD CONSTRAINT "FK_f2125896289f1e69103a8344413" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "seo_settings" ADD CONSTRAINT "FK_1cbf6f86c05ffd1eed349377f5d" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tags" ADD CONSTRAINT "FK_9b5bfa860bef5d644391fdf298b" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blog_posts" ADD CONSTRAINT "FK_1a5f8db3af7dbeca9064a0d3c31" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blog_categories" ADD CONSTRAINT "FK_3a4b7017823610c19b31f74af11" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blog_tags" ADD CONSTRAINT "FK_fa78fa32102e7b019a26a337b13" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_reviews" ADD CONSTRAINT "FK_37b0fd0be2b97d977e03de4fa10" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wishlists" ADD CONSTRAINT "FK_ca030e3c276e84ef3a06d76634c" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pages" ADD CONSTRAINT "FK_7c998d8a366263efe3b50feca13" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inquiries" ADD CONSTRAINT "FK_b33c8492b862a9ca2f38ed214d2" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_attempts" ADD CONSTRAINT "FK_334e552a811bd5d20909e87404e" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_attempts" ADD CONSTRAINT "FK_55a3a9977a52cdf06801751ba94" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_8afabeaa460738befe497e857c7" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "store_payment_configs" ADD CONSTRAINT "FK_5d5ef4e1e58ece1709da5e00cf1" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_7ca211e7a4a57288fcb55a6de97" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_782da5e50e94b763eb63225d69d" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_bundle_items" ADD CONSTRAINT "FK_1fba30c9a6e144faabc2713dfc3" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "collections" ADD CONSTRAINT "FK_068a0507b0e0fc23b06fcffd3f5" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_fa6ba3528de12e174b163c09fdd" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "discounts" ADD CONSTRAINT "FK_a4a5fe42d37dc850b3e18b853a2" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "estimates" ADD CONSTRAINT "FK_8cd9538874d04058a875159c681" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_eb3e3bde97446f8e51fbf47b76a" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_0f82354e5b05fd87884eff3a7b5" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "return_requests" ADD CONSTRAINT "FK_ee4c36f1b84fbde776bde44ad51" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_b7837678f3d750698394a80f70a" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
