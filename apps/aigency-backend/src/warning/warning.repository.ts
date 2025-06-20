import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Warning } from './warning.entity';

@Injectable()
export class WarningRepository extends Repository<Warning> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(Warning, dataSource.manager);
  }

  public async getUnpaidWarnings(username: string) {
    const query = `
      SELECT w.*
      FROM "default".warning w
      left join "default".reward_history rh on rh.related_item_type = 'bug' and rh.related_item_id = w.id
      where rh.id is null and w.username = $1
      order by w.created_at asc
    `;

    const rows = await this.dataSource.query<
      {
        id: string;
        username: string;
        title: string;
        description: string;
        created_at: string;
        is_deleted: boolean;
        hash: string;
      }[]
    >(query, [username]);

    return rows.map((row) =>
      this.create({
        id: row.id,
        username: row.username,
        title: row.title,
        description: row.description,
        createdAt: new Date(row.created_at),
        isDeleted: row.is_deleted,
        hash: row.hash,
      }),
    );
  }
}
