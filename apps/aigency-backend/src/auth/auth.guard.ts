import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import {
  CodedRpcException,
  JsonRpcContext,
  TypesafeKey,
} from '@dapplets/openrpc-nestjs-json-rpc';

const UserInfoKey = new TypesafeKey<UserInfo>('aigency:auth:UserInfo');

export type UserInfo = {
  id: number;
  first_name: string;
  last_name?: string;
  username: string;
  language_code?: string;
  allows_write_to_pm?: boolean;
  photo_url?: string;
};

export class AuthGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToRpc().getContext<JsonRpcContext>();
    const tgInitData = ctx.getMetadataByKey('Authorization');
    if (!tgInitData) return false;

    const tgInitDataParams = new URLSearchParams(tgInitData);

    const userJson = tgInitDataParams.get('user');
    if (!userJson) return false;

    const user = JSON.parse(userJson) as UserInfo;

    if (!user.username) {
      throw new CodedRpcException("User doesn't have username");
    }

    // ToDo: validate telegram initData

    ctx.customData.set(UserInfoKey, user);

    return true;
  }
}

export const UserInfo = createParamDecorator(
  (property: keyof UserInfo | undefined, ctx: ExecutionContext) => {
    const rpcCtx = ctx.switchToRpc().getContext<JsonRpcContext>();

    const user: UserInfo | undefined = rpcCtx.customData.get(UserInfoKey);

    return property ? user?.[property] : user;
  },
);
