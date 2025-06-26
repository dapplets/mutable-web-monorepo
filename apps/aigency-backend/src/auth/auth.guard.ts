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
      (await this._isValidInitData(tgInitData)) || this._isAdmin(tgInitData);

    if (!isValidToken) return false;

    const tgInitDataParams = new URLSearchParams(tgInitData);

    const userJson = tgInitDataParams.get('user');
    if (!userJson) return false;

    const user = JSON.parse(userJson) as UserInfo;

    if (!user.id) {
      throw new CodedRpcException("Telegram user doesn't have ID in init data");
    }

    // ToDo: validate telegram initData

    ctx.customData.set(UserInfoKey, user);

    return true;
  }

  private async _isValidInitData(tgInitData: string) {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN')!;
    const [botId] = botToken.split(':');
    return validate3rd(tgInitData, Number(botId))
      .then(() => true)
      .catch(() => false);
  }

  private _isAdmin(tgInitData: string) {
    const apiKey = this.configService.get<string>('AIGENCY_API_KEY');
    const tgInitDataParams = new URLSearchParams(tgInitData);
    return tgInitDataParams.get('api_key') === apiKey;
  }
}

export const UserInfo = createParamDecorator(
  (property: keyof UserInfo | undefined, ctx: ExecutionContext) => {
    const rpcCtx = ctx.switchToRpc().getContext<JsonRpcContext>();

    const user: UserInfo | undefined = rpcCtx.customData.get(UserInfoKey);

    return property ? user?.[property] : user;
  },
);
