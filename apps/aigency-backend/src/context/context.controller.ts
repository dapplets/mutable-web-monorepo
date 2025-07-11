import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { Body, UseFilters } from '@nestjs/common';
import { AllRpcExceptionsFilter } from 'src/common/all-rpc-exceptions.filter';
import { z } from 'zod';
import { RpcService } from '../common/rpc-service.decorator';
import {
  ContextService,
  TransferableContext,
  TransferableContextEdge,
} from './context.service';

const BaseContextSchema = z.object({
  namespace: z.string(),
  type: z.string(),
  id: z.string(),
  content: z.any(),
});

const ContextSchema = BaseContextSchema.extend({
  parent: BaseContextSchema.optional(),
});

const ContextEdgeSchema = z.object({
  fromContextNamespace: z.string(),
  fromContextType: z.string(),
  fromContextId: z.string(),
  toContextNamespace: z.string(),
  toContextType: z.string(),
  toContextId: z.string(),
});

@UseFilters(AllRpcExceptionsFilter)
@RpcService()
export class ContextController {
  constructor(private contextService: ContextService) {}

  @ZodToOpenRPC({
    params: z.object({
      source: z.string(),
      link: z.string(),
      timestamp: z.string(),
    }),
  })
  public async getContexts(
    @Body() params: { source: string; link: string; timestamp: string },
  ) {
    return this.contextService.getContexts(
      params.source,
      params.link,
      params.timestamp,
    );
  }

  @ZodToOpenRPC({
    params: z.object({
      link: z.string(),
    }),
  })
  public async getLastSavedTelegramMessageId(@Body() params: { link: string }) {
    return this.contextService.getLastSavedTelegramMessageId(params.link);
  }

  @ZodToOpenRPC({
    params: z.object({ context: ContextSchema }),
  })
  public async addContext(@Body() params: { context: TransferableContext }) {
    await this.contextService.addContext(params.context);
  }

  @ZodToOpenRPC({
    params: z.object({ contextEdge: ContextEdgeSchema }),
  })
  public async addContextEdge(
    @Body() params: { contextEdge: TransferableContextEdge },
  ) {
    await this.contextService.addContextEdge(params.contextEdge);
  }
}
