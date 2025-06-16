import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Warning } from './warning.entity';

@Injectable()
export class WarningRepository extends Repository<Warning> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Warning, dataSource.manager);
  }
}
