import { Body, UseFilters, UseGuards } from '@nestjs/common';
import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { AuthGuard, UserInfo } from '../auth/auth.guard';
import { MemoryService } from './memory.service';
import { RpcService } from '../common/rpc-service.decorator';
import { PaginationDto, PaginationSchema } from '../common/pagination.dto';
import { z } from 'zod';
import { AllRpcExceptionsFilter } from 'src/common/all-rpc-exceptions.filter';

@UseFilters(AllRpcExceptionsFilter)
// @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
@RpcService()
export class MemoryController {
  constructor(private memoryService: MemoryService) {}

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: PaginationSchema })
  public getMemories(
    @Body() params: PaginationDto,
    @UserInfo() user: UserInfo,
  ) {
    return this.memoryService.getMemories(user.id, params.limit, params.offset);
  }

  // ToDo: add admin auth guard
  @ZodToOpenRPC({
    params: z.object({
      userId: z.number(),
      limit: z.number(),
      offset: z.number(),
    }),
  })
  public getMemoriesByUser(
    @Body() params: { userId: number; limit: number; offset: number },
  ) {
    return this.memoryService.getMemories(
      params.userId,
      params.limit,
      params.offset,
    );
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({}) })
  public deleteAllMemories(@UserInfo() user: UserInfo) {
    return this.memoryService.deleteAllMemories(user.id);
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({ id: z.number() }) })
  public deleteMemory(
    @Body() params: { id: number },
    @UserInfo() user: UserInfo,
  ) {
    return this.memoryService.deleteMemory(user.id, params.id);
  }
}
