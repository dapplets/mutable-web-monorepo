import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Capability } from './capability.entity';

@Injectable()
export class CapabilityRepository extends Repository<Capability> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Capability, dataSource.manager);
  }
}
