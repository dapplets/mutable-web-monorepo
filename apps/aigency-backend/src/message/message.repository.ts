import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessageRepository extends Repository<Message> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(Message, dataSource.manager);
  }
}
