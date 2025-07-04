import { Body, UseFilters, UseGuards } from '@nestjs/common';
import {
  CodedRpcException,
  ZodToOpenRPC,
} from '@dapplets/openrpc-nestjs-json-rpc';
import { AuthGuard, UserInfo } from '../auth/auth.guard';
import { PaginationDto, PaginationSchema } from '../common/pagination.dto';
import { SubscriptionService } from './subscription.service';
import { RpcService } from '../common/rpc-service.decorator';
import { z } from 'zod';
import { AllRpcExceptionsFilter } from 'src/common/all-rpc-exceptions.filter';

@UseFilters(AllRpcExceptionsFilter)
// @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
@RpcService()
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: PaginationSchema })
  public getSubscriptions(
    @Body() params: PaginationDto,
    @UserInfo() user: UserInfo,
  ) {
    return this.subscriptionService.getSubscriptions(
      user.id,
      params.limit,
      params.offset,
    );
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({ id: z.number() }) })
  public enableSubscription(
    @Body() params: { id: number },
    @UserInfo() user: UserInfo,
  ) {
    return this.subscriptionService.enableSubscription(user.id, params.id);
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({ id: z.number() }) })
  public disableSubscription(
    @Body() params: { id: number },
    @UserInfo() user: UserInfo,
  ) {
    return this.subscriptionService.disableSubscription(user.id, params.id);
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({
    params: z.object({
      source: z.string(),
      link: z.string(),
      timestamp: z.string().optional(),
    }),
  })
  public addSubscription(
    @Body()
    params: { source: string; link: string; timestamp?: string },
    @UserInfo()
    user: UserInfo,
  ) {
    return this.subscriptionService.addSubscription(
      user.id,
      params.source,
      params.link,
      params.timestamp,
    );
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({ id: z.number() }) })
  public removeSubscription(
    @Body() params: { id: number },
    @UserInfo()
    user: UserInfo,
  ) {
    return this.subscriptionService.removeSubscription(user.id, params.id);
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({}) })
  public getNextScanOfSubscriptions() {
    return this.subscriptionService.getNextScanOfSubscriptions();
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({}) })
  public scanSubscriptions() {
    throw new CodedRpcException('Not implemented');
  }

  // ToDo: add admin auth guard
  @ZodToOpenRPC({
    params: z.object({
      userId: z.number(),
      source: z.string(),
      link: z.string(),
      timestamp: z.string(),
    }),
  })
  public setLastSeenPostTimestamp(
    @Body()
    params: {
      userId: number;
      source: string;
      link: string;
      timestamp: string;
    },
  ) {
    return this.subscriptionService.setLastSeenPostTimestamp(
      params.userId,
      params.source,
      params.link,
      params.timestamp,
    );
  }

  // ToDo: add admin auth guard
  @ZodToOpenRPC({
    params: z.object({
      userId: z.number(),
      onlyActive: z.boolean().optional(),
    }),
  })
  public getSubscriptionsByUser(
    @Body()
    params: {
      userId: number;
      onlyActive?: boolean;
    },
  ) {
    return this.subscriptionService.getSubscriptions(
      params.userId,
      Number.MAX_SAFE_INTEGER,
      0,
      params.onlyActive,
    );
  }
}
