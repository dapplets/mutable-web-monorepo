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
@UseGuards(AuthGuard)
@RpcService()
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

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

  @ZodToOpenRPC({ params: z.object({ id: z.number() }) })
  public enableSubscription(
    @Body() params: { id: number },
    @UserInfo() user: UserInfo,
  ) {
    return this.subscriptionService.enableSubscription(user.id, params.id);
  }

  @ZodToOpenRPC({ params: z.object({ id: z.number() }) })
  public disableSubscription(
    @Body() params: { id: number },
    @UserInfo() user: UserInfo,
  ) {
    return this.subscriptionService.disableSubscription(user.id, params.id);
  }

  @ZodToOpenRPC({ params: z.object({ source: z.string(), link: z.string() }) })
  public addSubscription(
    @Body()
    params: { source: string; link: string },
    @UserInfo()
    user: UserInfo,
  ) {
    return this.subscriptionService.addSubscription(
      user.id,
      params.source,
      params.link,
    );
  }

  @ZodToOpenRPC({ params: z.object({ id: z.number() }) })
  public removeSubscription(
    @Body() params: { id: number },
    @UserInfo()
    user: UserInfo,
  ) {
    return this.subscriptionService.removeSubscription(user.id, params.id);
  }

  @ZodToOpenRPC({ params: z.object({}) })
  public getNextScanOfSubscriptions() {
    return this.subscriptionService.getNextScanOfSubscriptions();
  }

  @ZodToOpenRPC({ params: z.object({}) })
  public scanSubscriptions() {
    throw new CodedRpcException('Not implemented');
  }
}
