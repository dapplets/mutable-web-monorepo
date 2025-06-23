import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Memory } from './memory.entity';

@Injectable()
export class MemoryRepository extends Repository<Memory> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(Memory, dataSource.manager);
  }
}
