import { UseFilters } from '@nestjs/common';
import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { TelegramService } from './telegram.service';
import { RpcService } from '../../common/rpc-service.decorator';
import { z } from 'zod';
import { AllRpcExceptionsFilter } from 'src/common/all-rpc-exceptions.filter';

// ToDo: add admin auth guard?
@UseFilters(AllRpcExceptionsFilter)
@RpcService()
export class TelegramController {
  constructor(private telegramService: TelegramService) {}

  @ZodToOpenRPC({ params: z.object({}) })
  public grabTelegrams() {
    return this.telegramService.grabSubmissions();
  }
}
