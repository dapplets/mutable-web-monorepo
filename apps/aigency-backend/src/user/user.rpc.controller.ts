import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { UseFilters, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { AuthGuard, UserInfo } from '../auth/auth.guard';
import { RpcService } from '../common/rpc-service.decorator';
import { UserService } from './user.service';
import { AllRpcExceptionsFilter } from '../common/all-rpc-exceptions.filter';

@UseFilters(AllRpcExceptionsFilter)
@UseGuards(AuthGuard)
@RpcService()
export class UserRpcController {
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

  @ZodToOpenRPC({ params: z.object({}) })
  public login(@UserInfo() user: UserInfo) {
    return this.userService.login(user.id);
  }

  @ZodToOpenRPC({ params: z.object({}) })
  public throw() {
    throw new Error('Test error');
  }
}
