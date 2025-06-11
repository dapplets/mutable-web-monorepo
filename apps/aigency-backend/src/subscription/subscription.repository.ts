import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Subscription } from './subscription.entity';

@Injectable()
export class SubscriptionRepository extends Repository<Subscription> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Subscription, dataSource.manager);
  }
}
