import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Subscription } from './subscription.entity';

@Injectable()
export class SubscriptionRepository extends Repository<Subscription> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(Subscription, dataSource.manager);
  }

  /**
   * Add value to the head of the array, trimming to 10 elements.
   * Atomically: executed with a single SQL command in the DB.
   */
  public async addEvaluation(
    entityId: number,
    newValue: number,
  ): Promise<void> {
    const query = `
      UPDATE subscriptions
      SET    evaluations = (array_prepend($1, evaluations))[1:10]
      WHERE  id = $2
      RETURNING evaluations;
      `;

    // to NUMERIC is possible to write number, TypeORM will convert it.
    const rows = await this.dataSource.query<{ evaluations: number[] }[]>(
      query,
      [newValue, entityId],
    );

    if (rows.length === 0) {
      throw new BadRequestException(`Subscription ${entityId} not found`);
    }
  }
}
