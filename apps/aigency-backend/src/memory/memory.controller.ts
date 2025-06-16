import { Body, UseGuards } from '@nestjs/common';
import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { AuthGuard, UserInfo } from '../auth/auth.guard';
import { MemoryService } from './memory.service';
import { RpcService } from '../common/rpc-service.decorator';
import { PaginationDto, PaginationSchema } from '../common/pagination.dto';
import { z } from 'zod';

@UseGuards(AuthGuard)
@RpcService()
export class MemoryController {
  constructor(private memoryService: MemoryService) {}

  @ZodToOpenRPC({ params: PaginationSchema })
  public getMemories(
    @Body() params: PaginationDto,
    @UserInfo() user: UserInfo,
  ) {
    return this.memoryService.getMemories(
      user.username,
      params.limit,
      params.offset,
    );
  }

  @ZodToOpenRPC({ params: z.object({}) })
  public deleteAllMemories(@UserInfo() user: UserInfo) {
    return this.memoryService.deleteAllMemories(user.username);
  }

  @ZodToOpenRPC({ params: z.object({ id: z.number() }) })
  public deleteMemory(
    @Body() params: { id: number },
    @UserInfo() user: UserInfo,
  ) {
    return this.memoryService.deleteMemory(user.username, params.id);
  }
}
