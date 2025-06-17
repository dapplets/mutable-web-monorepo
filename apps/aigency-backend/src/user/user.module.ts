import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserRpcController } from './user.rpc.controller';
import { UserRestController } from './user.rest.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserRepository, UserService],
  controllers: [UserRpcController, UserRestController],
  exports: [UserService],
})
export class UserModule {}
