import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { Body, UseFilters, UseGuards } from '@nestjs/common';
import { AllRpcExceptionsFilter } from 'src/common/all-rpc-exceptions.filter';
import { z } from 'zod';
import { AuthGuard, UserInfo } from '../auth/auth.guard';
import { PaginationDto, PaginationSchema } from '../common/pagination.dto';
import { RpcService } from '../common/rpc-service.decorator';
import { CapabilityService } from './capability.service';

@UseFilters(AllRpcExceptionsFilter)
// @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
@RpcService()
export class CapabilityController {
  constructor(private capabilityService: CapabilityService) {}

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: PaginationSchema })
  public getCapabilities(
    @Body() params: PaginationDto,
    @UserInfo() user: UserInfo,
  ) {
    return this.capabilityService.getCapabilitiesForUser(
      user.id,
      params.limit,
      params.offset,
    );
  }

  // ToDo: add admin auth guard
  @ZodToOpenRPC({
    params: z.object({
      domain: z.string(),
      name: z.string(),
      onlyActive: z.boolean().optional(),
    }),
  })
  public getUsersByCapability(
    @Body() params: { domain: string; name: string; onlyActive?: boolean },
  ) {
    return this.capabilityService.getUsersByCapability(
      params.domain,
      params.name,
      params.onlyActive,
    );
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({ id: z.string() }) })
  public removeCapability(
    @Body() params: { id: string },
    @UserInfo() user: UserInfo,
  ) {
    return this.capabilityService.removeCapability(user.id, params.id);
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({ id: z.string() }) })
  public enableCapability(
    @Body() params: { id: string },
    @UserInfo() user: UserInfo,
  ) {
    return this.capabilityService.enableCapability(user.id, params.id);
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({ id: z.string() }) })
  public disableCapability(
    @Body() params: { id: string },
    @UserInfo() user: UserInfo,
  ) {
    return this.capabilityService.disableCapability(user.id, params.id);
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({
    params: z.object({
      id: z.string(),
      text: z.string().optional(),
    }),
  })
  public callCapability(
    @Body() { id, ...message }: { id: string; text?: string },
    @UserInfo() user: UserInfo,
  ) {
    return this.capabilityService.callCapability(user.id, id, message);
  }

  @UseGuards(AuthGuard) // ToDo: ??????? how to guard only rpc methods?
  @ZodToOpenRPC({ params: z.object({}) })
  public syncCapabilities(@UserInfo() user: UserInfo) {
    return this.capabilityService.syncCapabilities(user.id);
  }
}
