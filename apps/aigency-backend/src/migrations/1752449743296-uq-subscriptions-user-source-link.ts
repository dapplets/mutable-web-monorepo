import { MigrationInterface, QueryRunner } from 'typeorm';

export class UqSubscriptionsUserSourceLink1752449743296
  implements MigrationInterface
{
  name = 'UqSubscriptionsUserSourceLink1752449743296';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ALTER COLUMN "source" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ALTER COLUMN "link" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ALTER COLUMN "evaluations" SET DEFAULT '{}'::numeric[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "UQ_subscriptions_user_source_link" UNIQUE ("userId", "source", "link")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "UQ_subscriptions_user_source_link"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ALTER COLUMN "evaluations" SET DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ALTER COLUMN "link" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ALTER COLUMN "source" DROP NOT NULL`,
    );
  }
}
