import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFinderTable1752338901112 implements MigrationInterface {
  name = 'AddFinderTable1752338901112';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "finder" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "is-active" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_1bee4a272c3926850e4a829f4e1" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "finder"`);
  }
}
