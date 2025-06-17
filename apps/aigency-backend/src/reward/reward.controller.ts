import { Body, UseGuards } from '@nestjs/common';
import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { AuthGuard, UserInfo } from '../auth/auth.guard';
import { RewardService } from './reward.service';
import { RpcService } from '../common/rpc-service.decorator';
import { z } from 'zod';

@UseGuards(AuthGuard)
@RpcService()
export class RewardController {
  constructor(private rewardService: RewardService) {}

  @ZodToOpenRPC({ params: z.object({}) })
  public getRewardAmount(@UserInfo() user: UserInfo) {
    return this.rewardService.getRewardAmount(user.username);
  }
}
