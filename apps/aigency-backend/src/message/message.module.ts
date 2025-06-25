import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageRepository, MessageService],
  controllers: [MessageController],
  exports: [MessageService],
})
export class MessageModule {}
