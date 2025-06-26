import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { Body, UseFilters } from '@nestjs/common';
import { z } from 'zod';
import { AllRpcExceptionsFilter } from '../common/all-rpc-exceptions.filter';
import { RpcService } from '../common/rpc-service.decorator';
import { BotService } from './bot.service';

@UseFilters(AllRpcExceptionsFilter)
@RpcService()
export class BotRpcController {
  constructor(private botService: BotService) {}

  @ZodToOpenRPC({
    params: z.object({ userId: z.number().or(z.string()), text: z.string() }),
  })
  public sendMessage(
    @Body() params: { userId: number | string; text: string },
  ) {
    return this.botService.sendMessage(params.userId, params.text);
  }

  @ZodToOpenRPC({
    params: z.object({ fileId: z.string() }),
  })
  public getFileUrl(@Body() params: { fileId: string }) {
    return this.botService.getFileUrl(params.fileId);
  }
}
