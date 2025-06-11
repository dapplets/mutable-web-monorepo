import { RpcService as _RpcService } from '@dapplets/openrpc-nestjs-json-rpc';

/**
 * Decorator with empty namespace and delimiter
 */
export const RpcService = () => _RpcService({ namespace: '', delimiter: '' });
