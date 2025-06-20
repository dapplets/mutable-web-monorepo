import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Usage } from './usage.entity';

@Injectable()
export class UsageRepository extends Repository<Usage> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(Usage, dataSource.manager);
  }

  public async getUsageHistory(
    username: string,
    limit: number,
    offset: number,
  ) {
    const total = (await this.query(
      `select count(*) as count
      from (
        select *
        from "default".reward_history rh 
        join "default".usage_history uh on uh.id = rh.related_item_id
        where uh.caller_username = $1
      )`,
      [username],
    )) as { count: number }[];

    const items = (await this.query(
      `select 
        rh.id, 
        c.domain as capability_domain,
        c.name as capability_name,
        rh.amount,
        uh.execution_input,
        uh.execution_output,
        rh.created_at,
        rh.recipient_account_id,
        case when rh.related_item_type = 'usage-caller' then 'income' else 'outcome' end as operation_type
      from "default".reward_history rh 
      join "default".usage_history uh on uh.id = rh.related_item_id 
      join "default".capability c on c.id = uh.capability_id 
      where uh.caller_username = $1
      order by rh.created_at desc
      limit $2
      offset $3`,
      [username, limit, offset],
    )) as {
      id: string;
      capability_domain: string;
      capability_name: string;
      amount: string;
      execution_input: string;
      execution_output: string;
      created_at: string;
      recipient_account_id: string;
      operation_type: string;
    }[];

    return [
      items.map((item) => ({
        id: item.id,
        capabilityDomain: item.capability_domain,
        capabilityName: item.capability_name,
        amount: item.amount,
        executionInput: item.execution_input,
        executionOutput: item.execution_output,
        createdAt: item.created_at,
        operationType: item.operation_type,
      })),
      total[0].count,
    ];
  }

  public async getUnpaidUsagesForUsageCaller(username: string) {
    return this._getUnpaidUsages(username, 'usage-caller');
  }

  public async getUnpaidUsagesForUsageOwner(username: string) {
    return this._getUnpaidUsages(username, 'usage-owner');
  }

  private async _getUnpaidUsages(username: string, rewardReason: string) {
    const query = `
      SELECT uh.*
      FROM "default".usage_history uh
      LEFT JOIN "default".reward_history rh 
        ON rh.related_item_type = $2 AND rh.related_item_id = uh.id
      WHERE rh.id IS NULL AND uh.caller_username = $1
      ORDER BY uh.created_at ASC
    `;

    const rows = await this.dataSource.query<
      {
        id: string;
        caller_username: string;
        capability_id: string;
        created_at: string;
        execution_input: string;
        execution_output: string;
      }[]
    >(query, [username, rewardReason]);

    return rows.map((row) =>
      this.create({
        id: row.id,
        callerUsername: row.caller_username,
        capabilityId: row.capability_id,
        createdAt: new Date(row.created_at),
        executionInput: row.execution_input,
        executionOutput: row.execution_output,
      }),
    );
  }
}
