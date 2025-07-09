import { Body, UseFilters, UseGuards } from '@nestjs/common';
import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { AuthGuard, UserInfo } from '../auth/auth.guard';
import { MessageService } from './message.service';
import { RpcService } from '../common/rpc-service.decorator';
import { z } from 'zod';
import { AllRpcExceptionsFilter } from 'src/common/all-rpc-exceptions.filter';
import { StoredAigencyMessageData } from './message.entity';

@UseFilters(AllRpcExceptionsFilter)
// @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
@RpcService()
export class MessageController {
  constructor(private messageService: MessageService) {}

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
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
    return this.messageService.getMessages({
      userId: user.id,
      sessionId: params.sessionId,
      limit: params.limit,
      offset: params.offset,
    });
  }

  // ToDo: add admin auth guard
  @ZodToOpenRPC({
    params: z.object({
      userId: z.number(),
      limit: z.number(),
      offset: z.number(),
    }),
  })
  public getMessagesByUser(
    @Body()
    params: {
      userId: number;
      limit: number;
      offset: number;
    },
  ) {
    return this.messageService.getMessages({
      userId: params.userId,
      limit: params.limit,
      offset: params.offset,
    });
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
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

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({ sessionId: z.string() }) })
  public deleteMessages(
    @Body() params: { sessionId: string },
    @UserInfo() user: UserInfo,
  ) {
    return this.messageService.deleteMessages(user.id, params.sessionId);
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({
    params: z.object({ sessionId: z.string(), messageId: z.string() }),
  })
  public deleteMessage(
    @Body() params: { sessionId: string; messageId: string },
    @UserInfo() user: UserInfo,
  ) {
    return this.messageService.deleteMessage(
      user.id,
      params.messageId,
      params.sessionId,
    );
  }

  // ToDo: add admin auth guard
  @ZodToOpenRPC({
    params: z.object({
      userId: z.number(),
      messageId: z.string(),
      sessionId: z.string().optional(),
    }),
  })
  public deleteMessageByUser(
    @Body() params: { userId: number; messageId: string; sessionId?: string },
  ) {
    return this.messageService.deleteMessage(
      params.userId,
      params.messageId,
      params.sessionId ?? params.userId.toString(),
    );
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({
    params: z.object({ sessionId: z.string(), limit: z.number() }),
  })
  public deleteLastMessages(
    @Body() params: { sessionId: string; limit: number },
    @UserInfo() user: UserInfo,
  ) {
    return this.messageService.deleteLastMessages(
      user.id,
      params.sessionId,
      params.limit,
    );
  }
}
