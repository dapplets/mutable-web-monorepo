import { Body, UseGuards } from '@nestjs/common';
import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { AuthGuard, UserInfo } from '../auth/auth.guard';
import { PaginationDto, PaginationSchema } from '../common/pagination.dto';
import { SubscriptionService } from './subscription.service';
import { RpcService } from '../common/rpc-service.decorator';
import { z } from 'zod';

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
      user.username,
      params.limit,
      params.offset,
    );
  }

  @ZodToOpenRPC({ params: z.object({ id: z.number() }) })
  public enableSubscription(
    @Body() params: { id: number },
    @UserInfo() user: UserInfo,
  ) {
    return this.subscriptionService.enableSubscription(
      user.username,
      params.id,
    );
  }

  @ZodToOpenRPC({ params: z.object({ id: z.number() }) })
  public disableSubscription(
    @Body() params: { id: number },
    @UserInfo() user: UserInfo,
  ) {
    return this.subscriptionService.disableSubscription(
      user.username,
      params.id,
    );
  }

  @ZodToOpenRPC({ params: z.object({ source: z.string(), link: z.string() }) })
  public addSubscription(
    @Body()
    params: { source: string; link: string },
    @UserInfo()
    user: UserInfo,
  ) {
    return this.subscriptionService.addSubscription(
      user.username,
      user.id.toString(),
      params.source,
      params.link,
    );
  }
}
