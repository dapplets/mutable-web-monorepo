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

  @ZodToOpenRPC({ params: z.object({}) })
  public getBalance(@UserInfo() user: UserInfo) {
    return this.userService.getBalance(user.id);
  }

  @ZodToOpenRPC({ params: z.object({}) })
  public getDevMode(@UserInfo() user: UserInfo) {
    return this.userService.getDevMode(user.id);
  }

  @ZodToOpenRPC({ params: z.object({}) })
  public enableDevMode(@UserInfo() user: UserInfo) {
    return this.userService.enableDevMode(user.id);
  }

  @ZodToOpenRPC({ params: z.object({}) })
  public disableDevMode(@UserInfo() user: UserInfo) {
    return this.userService.disableDevMode(user.id);
  }

  @ZodToOpenRPC({ params: z.object({}) })
  public logout(@UserInfo() user: UserInfo) {
    return this.userService.logout(user.id);
  }
}
