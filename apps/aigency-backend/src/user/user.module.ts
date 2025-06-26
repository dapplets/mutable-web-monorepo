import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserRpcController } from './user.rpc.controller';
import { UserRestController } from './user.rest.controller';
import { UserBotController } from './user.bot.controller';
import { BotModule } from 'src/bot';

@Module({
  imports: [TypeOrmModule.forFeature([User]), BotModule],
  providers: [UserBotController, UserRepository, UserService],
  controllers: [UserRpcController, UserRestController],
  exports: [UserService],
})
export class UserModule {}
