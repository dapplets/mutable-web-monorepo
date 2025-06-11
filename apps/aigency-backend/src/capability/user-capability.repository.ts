import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserCapability } from './user-capability.entity';

@Injectable()
export class UserCapabilityRepository extends Repository<UserCapability> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(UserCapability, dataSource.manager);
  }

  async getCapabilitiesForUser(
    username: string,
    limit: number,
    offset: number,
  ) {
    return this.findAndCount({
      where: { username, isDeleted: false },
      relations: { capability: true },
      order: { capability: { domain: 'ASC', name: 'ASC' } },
      take: limit,
      skip: offset,
    });
  }
}
