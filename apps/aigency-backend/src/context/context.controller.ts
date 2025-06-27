import { Body, UseFilters } from '@nestjs/common';
import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { ContextService, TransferableContext } from './context.service';
import { RpcService } from '../common/rpc-service.decorator';
import { z } from 'zod';
import { AllRpcExceptionsFilter } from 'src/common/all-rpc-exceptions.filter';

const BaseContextSchema = z.object({
  namespace: z.string(),
  type: z.string(),
  id: z.string(),
  content: z.any(),
});

const ContextSchema = BaseContextSchema.extend({
  parent: BaseContextSchema.optional(),
});

@UseFilters(AllRpcExceptionsFilter)
@RpcService()
export class ContextController {
  constructor(private contextService: ContextService) {}

  @ZodToOpenRPC({
    params: z.object({ context: ContextSchema }),
  })
  public async addContext(@Body() params: { context: TransferableContext }) {
    await this.contextService.addContext(params.context);
  }
}
