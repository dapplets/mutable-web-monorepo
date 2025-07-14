import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ContextNode } from './context-node.entity';

@Injectable()
export class ContextNodeRepository extends Repository<ContextNode> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(ContextNode, dataSource.manager);
  }

  public async getContextsByProfile(
    source: string,
    link: string,
    timestamp: string,
    providerId?: string,
  ) {
    const query = `
      SELECT cn.*
      FROM context_edge ce
      join context_node cn
        on cn.namespace = ce.to_context_namespace
        and cn.type = ce.to_context_type 
        and cn.id = ce.to_context_id
        and cn.timestamp > $3
      where
        ce.from_context_namespace = $1
        and ce.from_context_type = 'profile'
        and ce.from_context_id = $2
    `;

    let rows = await this.dataSource.query<
      {
        namespace: string;
        type: string;
        id: string;
        content: string;
        timestamp: string;
        provider_id: string | null;
      }[]
    >(query, [source, link, timestamp]);

    if (providerId) {
      rows = rows.filter((row) => row.provider_id! === providerId);
    }

    return rows.map((row) =>
      this.create({
        namespace: row.namespace,
        type: row.type,
        id: row.id,
        content: row.content,
        timestamp: new Date(row.timestamp),
        providerId: row.provider_id,
      }),
    );
  }

  public async getLastSavedTelegramMessageId(link: string) {
    const query = `
      select max(cast(cn.id as int))
      from context_edge ce
      join context_node cn
        on cn.namespace = ce.to_context_namespace
        and cn.type = ce.to_context_type 
        and cn.id = ce.to_context_id
      where
        ce.from_context_namespace = 'telegram'
        and ce.from_context_type = 'profile'
        and ce.from_context_id = $1
    `;

    const rows = await this.dataSource.query<
      {
        max: number;
      }[]
    >(query, [link]);

    return rows[0].max;
  }
}
