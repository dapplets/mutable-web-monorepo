import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedSubscriptionsTableColumn1751613775671
  implements MigrationInterface
{
  name = 'AddedSubscriptionsTableColumn1751613775671';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "last_seen_post_timestamp" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "last_seen_post_timestamp"`,
    );
  }
}
