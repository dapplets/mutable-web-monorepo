import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompleteContextNodeAddSubscription1752393895755
  implements MigrationInterface
{
  name = 'CompleteContextNodeAddSubscription1752393895755';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "is_by_finder" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "evaluations" numeric array DEFAULT '{}'::numeric[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "context_node" ADD "provider_id" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "context_node" DROP COLUMN "provider_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "evaluations"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "is_by_finder"`,
    );
  }
}
