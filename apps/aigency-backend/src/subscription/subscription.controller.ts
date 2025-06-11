import { Body, UseGuards } from '@nestjs/common';
import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { AuthGuard, UserInfo } from 'src/auth/auth.guard';
import { PaginationDto, PaginationSchema } from 'src/common/pagination.dto';
import { SubscriptionService } from './subscription.service';
import { RpcService } from '../common/rpc-service.decorator';

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
}
