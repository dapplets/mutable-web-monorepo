import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ContextEdge } from './context-edge.entity';

@Injectable()
export class ContextEdgeRepository extends Repository<ContextEdge> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(ContextEdge, dataSource.manager);
  }
}
