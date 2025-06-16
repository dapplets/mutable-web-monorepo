import { Body, UseGuards } from '@nestjs/common';
import { ZodToOpenRPC } from '@dapplets/openrpc-nestjs-json-rpc';
import { AuthGuard, UserInfo } from '../auth/auth.guard';
import { WarningService } from './warning.service';
import { RpcService } from '../common/rpc-service.decorator';
import { PaginationDto, PaginationSchema } from 'src/common/pagination.dto';

@UseGuards(AuthGuard)
@RpcService()
export class WarningController {
  constructor(private warningService: WarningService) {}

  @ZodToOpenRPC({ params: PaginationSchema })
  public getWarnings(
    @Body() params: PaginationDto,
    @UserInfo() user: UserInfo,
  ) {
    return this.warningService.getWarnings(
      user.username,
      params.limit,
      params.offset,
    );
  }
}
