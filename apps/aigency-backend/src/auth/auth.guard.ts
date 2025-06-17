import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import {
  CodedRpcException,
  JsonRpcContext,
  TypesafeKey,
} from '@dapplets/openrpc-nestjs-json-rpc';
import { validate3rd } from '@telegram-apps/init-data-node';
import { ConfigService } from '@nestjs/config';

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
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToRpc().getContext<JsonRpcContext>();
    const tgInitData = ctx.getMetadataByKey('Authorization')?.substring(7);
    if (!tgInitData) return false;

    const isValidToken =
      (await this._isMainBot(tgInitData)) ||
      (await this._isDebugBot(tgInitData));

    if (!isValidToken) return false;

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

  private async _isMainBot(tgInitData: string) {
    const mainBotId = this.configService.get<number>('TELEGRAM_MAIN_BOT_ID')!;
    return validate3rd(tgInitData, mainBotId)
      .then(() => true)
      .catch(() => false);
  }

  private async _isDebugBot(tgInitData: string) {
    const debugBotId = this.configService.get<number>('TELEGRAM_DEBUG_BOT_ID');
    if (!debugBotId) return false;
    return validate3rd(tgInitData, debugBotId)
      .then(() => true)
      .catch(() => false);
  }
}

export const UserInfo = createParamDecorator(
  (property: keyof UserInfo | undefined, ctx: ExecutionContext) => {
    const rpcCtx = ctx.switchToRpc().getContext<JsonRpcContext>();

    const user: UserInfo | undefined = rpcCtx.customData.get(UserInfoKey);

    return property ? user?.[property] : user;
  },
);
