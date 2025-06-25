import { Module } from '@nestjs/common';
import { AuthRpcController } from './auth.rpc.controller';
import { RpcDiscoverModule } from '@dapplets/openrpc-nestjs-json-rpc';

@Module({
  imports: [RpcDiscoverModule],
  controllers: [AuthRpcController],
})
export class AuthModule {}
