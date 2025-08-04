import { UseFilters } from '@nestjs/common';
import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { RedditService } from './reddit.service';
import { RpcService } from '../../common/rpc-service.decorator';
import { z } from 'zod';
import { AllRpcExceptionsFilter } from 'src/common/all-rpc-exceptions.filter';

// ToDo: add admin auth guard?
@UseFilters(AllRpcExceptionsFilter)
@RpcService()
export class RedditController {
  constructor(private redditService: RedditService) {}

  @ZodToOpenRPC({
    params: z.object({
      channelName: z.string().optional(),
    }),
  })
  public grabReddits(params: { channelName?: string }) {
    return this.redditService.grabReddits(params.channelName);
  }
}
