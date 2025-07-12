import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { UseFilters, UseGuards } from '@nestjs/common';
import { AllRpcExceptionsFilter } from 'src/common/all-rpc-exceptions.filter';
import { z } from 'zod';
import { AuthGuard, UserInfo } from '../auth/auth.guard';
import { RpcService } from '../common/rpc-service.decorator';
import { FinderService } from './finder.service';

@UseFilters(AllRpcExceptionsFilter)
// @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
@RpcService()
export class FinderController {
  constructor(private finderService: FinderService) {}

  // ToDo: add admin auth guard
  @ZodToOpenRPC({ params: z.object({}) })
  public getActiveFinders() {
    return this.finderService.getActiveFinders();
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({}) })
  public getFinderActivityState(@UserInfo() user: UserInfo) {
    return this.finderService.getFinderActivityState({
      userId: user.id,
    });
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({}) })
  public enableFinder(@UserInfo() user: UserInfo) {
    return this.finderService.enableFinder(user.id);
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({}) })
  public disableFinder(@UserInfo() user: UserInfo) {
    return this.finderService.disableFinder(user.id);
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({
    params: z.object({}),
  })
  public addFinder(
    @UserInfo()
    user: UserInfo,
  ) {
    return this.finderService.addFinder(user.id);
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({}) })
  public removeFinder(
    @UserInfo()
    user: UserInfo,
  ) {
    return this.finderService.removeFinder(user.id);
  }
}
