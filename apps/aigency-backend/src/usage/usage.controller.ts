import { Body, UseGuards } from '@nestjs/common';
import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { AuthGuard, UserInfo } from '../auth/auth.guard';
import { UsageService } from './usage.service';
import { RpcService } from '../common/rpc-service.decorator';
import { PaginationDto, PaginationSchema } from 'src/common/pagination.dto';

@UseGuards(AuthGuard)
@RpcService()
export class UsageController {
  constructor(private usageService: UsageService) {}

  @ZodToOpenRPC({ params: PaginationSchema })
  public getUsageHistory(
    @Body() params: PaginationDto,
    @UserInfo() user: UserInfo,
  ) {
    return this.usageService.getUsageHistory(
      user.username,
      params.limit,
      params.offset,
    );
  }
}
