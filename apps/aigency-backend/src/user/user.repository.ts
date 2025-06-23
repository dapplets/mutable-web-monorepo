import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(User, dataSource.manager);
  }
}
