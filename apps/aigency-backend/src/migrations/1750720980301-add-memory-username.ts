import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemoryUsername1750720980301 implements MigrationInterface {
  name = 'AddMemoryUsername1750720980301';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "memory" ADD "username" text NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "memory" DROP COLUMN "username"`);
  }
}
