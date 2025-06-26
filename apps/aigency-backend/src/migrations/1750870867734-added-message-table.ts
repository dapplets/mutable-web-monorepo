import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedMessageTable1750870867734 implements MigrationInterface {
  name = 'AddedMessageTable1750870867734';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message" jsonb NOT NULL, "user_id" integer NOT NULL, "session_id" character varying NOT NULL, "datetime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "message"`);
  }
}
