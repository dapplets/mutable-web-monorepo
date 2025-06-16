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
    this._validateUsername(username);

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
    this._validateUsername(username);

    await this.dataSource.query(`DELETE FROM "personal-data"."${username}"`);
  }

  async deleteMemory(username: string, id: number) {
    this._validateUsername(username);

    await this.dataSource.query(
      `DELETE FROM "personal-data"."${username}" WHERE id = $1`,
      [id],
    );
  }

  private _validateUsername(username: string) {
    // prevents SQL injection
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Invalid username');
    }
  }
}
