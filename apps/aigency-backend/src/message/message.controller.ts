import { Body, UseFilters, UseGuards } from '@nestjs/common';
import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { AuthGuard, UserInfo } from '../auth/auth.guard';
import { MessageService } from './message.service';
import { RpcService } from '../common/rpc-service.decorator';
import { z } from 'zod';
import { AllRpcExceptionsFilter } from 'src/common/all-rpc-exceptions.filter';
import { StoredAigencyMessageData } from './message.entity';

@UseFilters(AllRpcExceptionsFilter)
@UseGuards(AuthGuard)
@RpcService()
export class MessageController {
  constructor(private messageService: MessageService) {}

  @ZodToOpenRPC({
    params: z.object({
      sessionId: z.string(),
      limit: z.number(),
      offset: z.number(),
    }),
  })
  public getMessages(
    @Body() params: { sessionId: string; limit: number; offset: number },
    @UserInfo() user: UserInfo,
  ) {
    return this.messageService.getMessages(
      user.id,
      params.sessionId,
      params.limit,
      params.offset,
    );
  }

  @ZodToOpenRPC({
    params: z.object({
      sessionId: z.string(),
      message: z.object({
        name: z.string().optional(),
        role: z.string().optional(),
        content: z.string(),
        additional_kwargs: z.record(z.any()).optional(),
        type: z.string(),
        tool_call_id: z.string().optional(),
      }),
    }),
  })
  public addMessage(
    @Body() message: { sessionId: string; message: StoredAigencyMessageData },
    @UserInfo() user: UserInfo,
  ) {
    return this.messageService.addMessage(user.id, message);
  }

  @ZodToOpenRPC({ params: z.object({ sessionId: z.string() }) })
  public deleteMessages(
    @Body() params: { sessionId: string },
    @UserInfo() user: UserInfo,
  ) {
    return this.messageService.deleteMessages(user.id, params.sessionId);
  }
}
