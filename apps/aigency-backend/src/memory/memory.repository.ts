import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Memory } from './memory.entity';

@Injectable()
export class MemoryRepository extends Repository<Memory> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(Memory, dataSource.manager);
  }

  async getMemories(
    username: string,
    limit: number,
    offset: number,
  ): Promise<[Memory[], number]> {
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Invalid username');
    }

    const rows = await this.dataSource.query<
      {
        id: number;
        data: string;
        datetime: string;
      }[]
    >(
      `SELECT * 
      FROM "personal-data"."${username}" 
      ORDER BY id DESC 
      LIMIT $1 
      OFFSET $2`,
      [limit, offset],
    );

    const items = rows.map((row) => {
      const memory = new Memory();

      memory.id = row.id;
      memory.data = row.data;
      memory.createdAt = new Date(row.datetime);

      return memory;
    });

    return [items, rows.length];
  }

  async deleteAllMemories(username: string) {
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Invalid username');
    }

    await this.dataSource.query(`DELETE FROM "personal-data"."${username}"`);
  }
}
