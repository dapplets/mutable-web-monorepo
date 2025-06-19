import { Body, UseFilters, UseGuards } from '@nestjs/common';
import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { z } from 'zod';
import { AuthGuard, UserInfo } from '../auth/auth.guard';
import { PaginationDto, PaginationSchema } from '../common/pagination.dto';
import { CapabilityService } from './capability.service';
import { RpcService } from '../common/rpc-service.decorator';
import { AllRpcExceptionsFilter } from 'src/common/all-rpc-exceptions.filter';

@UseFilters(AllRpcExceptionsFilter)
@UseGuards(AuthGuard)
@RpcService()
export class CapabilityController {
  constructor(private capabilityService: CapabilityService) {}

  @ZodToOpenRPC({ params: PaginationSchema })
  public getCapabilities(
    @Body() params: PaginationDto,
    @UserInfo() user: UserInfo,
  ) {
    return this.capabilityService.getCapabilitiesForUser(
      user.username,
      params.limit,
      params.offset,
    );
  }

  @ZodToOpenRPC({ params: z.object({ id: z.string() }) })
  public removeCapability(
    @Body() params: { id: string },
    @UserInfo() user: UserInfo,
  ) {
    return this.capabilityService.removeCapability(user.username, params.id);
  }

  @ZodToOpenRPC({ params: z.object({ id: z.string() }) })
  public enableCapability(
    @Body() params: { id: string },
    @UserInfo() user: UserInfo,
  ) {
    return this.capabilityService.enableCapability(user.username, params.id);
  }

  @ZodToOpenRPC({ params: z.object({ id: z.string() }) })
  public disableCapability(
    @Body() params: { id: string },
    @UserInfo() user: UserInfo,
  ) {
    return this.capabilityService.disableCapability(user.username, params.id);
  }

  @ZodToOpenRPC({ params: z.object({}) })
  public syncCapabilities(@UserInfo() user: UserInfo) {
    return this.capabilityService.syncCapabilities(user.username);
  }
}
