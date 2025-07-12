import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Finder } from './finder.entity';

@Injectable()
export class FinderRepository extends Repository<Finder> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Finder, dataSource.manager);
  }
}
