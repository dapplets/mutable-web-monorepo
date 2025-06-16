import { Body, UseGuards } from '@nestjs/common';
import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { AuthGuard, UserInfo } from '../auth/auth.guard';
import { UserService } from './user.service';
import { RpcService } from '../common/rpc-service.decorator';
import { z } from 'zod';

@UseGuards(AuthGuard)
@RpcService()
export class UserController {
  constructor(private userService: UserService) {}

  @ZodToOpenRPC({ params: z.object({}) })
  public getCurrentUser(@UserInfo() user: UserInfo) {
    return this.userService.getUserById(user.id);
  }
}
