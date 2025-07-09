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

    const rows = await this.dataSource.query<
      {
        namespace: string;
        type: string;
        id: string;
        content: string;
        timestamp: string;
      }[]
    >(query, [source, link, timestamp]);

    return rows.map((row) =>
      this.create({
        namespace: row.namespace,
        type: row.type,
        id: row.id,
        content: row.content,
        timestamp: new Date(row.timestamp),
      }),
    );
  }
}
