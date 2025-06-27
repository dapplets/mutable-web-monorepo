import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ContextNode } from './context-node.entity';

@Injectable()
export class ContextNodeRepository extends Repository<ContextNode> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(ContextNode, dataSource.manager);
  }
}
