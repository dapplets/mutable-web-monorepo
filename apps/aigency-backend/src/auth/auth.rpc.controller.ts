import {
  CodedRpcException,
  JsonRpcContext,
  RpcDiscoverService,
  ZodToOpenRPC,
} from '@dapplets/openrpc-nestjs-json-rpc';
import { UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ctx } from '@nestjs/microservices';
import { z } from 'zod';
import { AllRpcExceptionsFilter } from '../common/all-rpc-exceptions.filter';
import { RpcService } from '../common/rpc-service.decorator';

@UseFilters(AllRpcExceptionsFilter)
@RpcService()
export class AuthRpcController {
  constructor(
    private configService: ConfigService,
    private rpcDiscoverService: RpcDiscoverService,
  ) {}

  @ZodToOpenRPC({ params: z.object({}) })
  public getStatus(@Ctx() ctx: JsonRpcContext) {
    const authHeader = ctx.getMetadataByKey('Authorization')?.substring(7);
    const apiKey = this.configService.get<string>('AIGENCY_API_KEY')!;

    const tgInitDataParams = new URLSearchParams(authHeader);

    if (tgInitDataParams.get('api_key') !== apiKey) {
      throw new CodedRpcException('Invalid API key', 401);
    }

    return {
      status: 'ok',
    };
  }

  @ZodToOpenRPC({ params: z.object({}) })
  public getOpenRPCDocument() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.rpcDiscoverService.getOpenRPCDocument();
  }
}
