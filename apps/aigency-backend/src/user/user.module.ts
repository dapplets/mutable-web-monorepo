import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserRpcController } from './user.rpc.controller';
import { UserRestController } from './user.rest.controller';
import { UserBotController } from './user.bot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserBotController, UserRepository, UserService],
  controllers: [UserRpcController, UserRestController],
  exports: [UserService],
})
export class UserModule {}
