import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1750693547566 implements MigrationInterface {
  name = 'Init1750693547566';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "warning" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" text NOT NULL, "title" text, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "hash" text NOT NULL, CONSTRAINT "PK_54ddc381cc95ffd6909e427b093" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" integer NOT NULL, "username" character varying(32) NOT NULL, "status" boolean NOT NULL DEFAULT true, "near_account_id" character varying, "private_key" character varying, "network_id" character varying, "nearai_token" character varying, "isdeveloper" boolean NOT NULL DEFAULT false, CONSTRAINT "CHK_2056962559f0f3e1857d9e6ec7" CHECK ("username" ~ '^[a-z0-9]+$'), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reward_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recipient_account_id" text, "amount" text NOT NULL, "tx_hash" text, "related_item_type" text NOT NULL, "related_item_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_b57fe3811ae0fa8d3da40994ce" UNIQUE ("related_item_id"), CONSTRAINT "PK_1790d3b4570b3f09a5d486b8193" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "usage_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "caller_username" text NOT NULL, "capability_id" uuid NOT NULL, "execution_input" text, "execution_output" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8a625610ae5962285caca7324d7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "memory" ("id" SERIAL NOT NULL, "data" text, "datetime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_719a982d08209b92cd1a0b1c4ec" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "context_node" ("namespace" character varying NOT NULL, "type" character varying NOT NULL, "id" character varying NOT NULL, "content" text, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_114d0eb4b83987158c15a105da5" PRIMARY KEY ("namespace", "type", "id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_114d0eb4b83987158c15a105da" ON "context_node" ("namespace", "type", "id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "context_edge" ("from_context_namespace" character varying NOT NULL, "from_context_type" character varying NOT NULL, "from_context_id" character varying NOT NULL, "to_context_namespace" character varying NOT NULL, "to_context_type" character varying NOT NULL, "to_context_id" character varying NOT NULL, CONSTRAINT "PK_8a7c7a2d1552b737d0e7f2e2bd2" PRIMARY KEY ("from_context_namespace", "from_context_type", "from_context_id", "to_context_namespace", "to_context_type", "to_context_id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8a7c7a2d1552b737d0e7f2e2bd" ON "context_edge" ("from_context_namespace", "from_context_type", "from_context_id", "to_context_namespace", "to_context_type", "to_context_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "capability" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "domain" text NOT NULL, "name" text NOT NULL, "title" text, "description" text, "token_id" text, "beneficiary_network" text, "beneficiary_account_id" text, "stars" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_a30c8f80d9cbf7c1315b30acfe4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_capability" ("username" character varying NOT NULL, "capability_id" uuid NOT NULL, "is_enabled" boolean NOT NULL DEFAULT true, "is_deleted" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_a115ff8f2316f1342d873636999" PRIMARY KEY ("username", "capability_id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a115ff8f2316f1342d87363699" ON "user_capability" ("username", "capability_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" SERIAL NOT NULL, "username" character varying, "userid" character varying, "source" character varying, "link" character varying, "is-active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "variables" ("type" character varying NOT NULL, "value" character varying, "default" character varying, CONSTRAINT "PK_0deaea6c1763448539805b3b8df" PRIMARY KEY ("type"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_history" ADD CONSTRAINT "FK_b57fe3811ae0fa8d3da40994ce6" FOREIGN KEY ("related_item_id") REFERENCES "usage_history"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_capability" ADD CONSTRAINT "FK_450b8ba7eca0acf94c72256e2ed" FOREIGN KEY ("capability_id") REFERENCES "capability"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_capability" DROP CONSTRAINT "FK_450b8ba7eca0acf94c72256e2ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_history" DROP CONSTRAINT "FK_b57fe3811ae0fa8d3da40994ce6"`,
    );
    await queryRunner.query(`DROP TABLE "variables"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP INDEX "IDX_a115ff8f2316f1342d87363699"`);
    await queryRunner.query(`DROP TABLE "user_capability"`);
    await queryRunner.query(`DROP TABLE "capability"`);
    await queryRunner.query(`DROP INDEX "IDX_8a7c7a2d1552b737d0e7f2e2bd"`);
    await queryRunner.query(`DROP TABLE "context_edge"`);
    await queryRunner.query(`DROP INDEX "IDX_114d0eb4b83987158c15a105da"`);
    await queryRunner.query(`DROP TABLE "context_node"`);
    await queryRunner.query(`DROP TABLE "memory"`);
    await queryRunner.query(`DROP TABLE "usage_history"`);
    await queryRunner.query(`DROP TABLE "reward_history"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "warning"`);
  }
}
