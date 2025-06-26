import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Account } from '@near-js/accounts';
import { JsonRpcProvider } from '@near-js/providers';
import { ConfigService } from '@nestjs/config';
import { formatNearAmount } from '@near-js/utils';
import { CodedRpcException } from '@dapplets/openrpc-nestjs-json-rpc';
import { KeyPair } from '@near-js/crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from './user-created.event';
import { UserDeletedEvent } from './user-deleted.event';
import { TelegrafContext } from 'src/common/telegraf-context.interface';
import { Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';

@Injectable()
export class UserService {
  private _pendingLogins = new Map<
    string,
    { userId: number; privateKey: string }
  >();

  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @InjectBot() private bot: Telegraf<TelegrafContext>,
  ) {}

  async getUserById(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    return user?.toDto();
  }

  async getBalance(id: number) {
    const user = await this.userRepository.findOneByOrFail({ id });

    if (!user.nearAccountId) {
      throw new CodedRpcException('User is not logged in');
    }

    const balance = await this._getBalance(user.nearAccountId);

    return {
      balance: {
        available: balance.toString(),
      },
      formatted: {
        available: formatNearAmount(balance.toString(), 4),
      },
    };
  }

  async getDevMode(id: number) {
    const user = await this.userRepository.findOneByOrFail({ id });
    return user.isDeveloper;
  }

  async enableDevMode(id: number) {
    const user = await this.userRepository.findOneByOrFail({ id });

    user.isDeveloper = true;

    await this.userRepository.save(user);
  }

  async disableDevMode(id: number) {
    const user = await this.userRepository.findOneByOrFail({ id });

    user.isDeveloper = false;

    await this.userRepository.save(user);
  }

  async logout(id: number) {
    const user = await this.userRepository.findOneByOrFail({ id });

    // clear auth user data
    user.nearAccountId = null;
    user.privateKey = null;
    user.networkId = null;
    user.nearAiToken = null;

    await this.userRepository.save(user);
  }

  login(userId: number) {
    const aigencyApiUrl = this.configService.get<string>('AIGENCY_API_URL')!;
    const walletUrl = this.configService.get<string>('NEAR_WALLET_URL')!;
    const nearLoginContractId = this.configService.get<string>(
      'NEAR_LOGIN_CONTRACT_ID',
    )!;

    const keyPair = KeyPair.fromRandom('ed25519');
    const publicKey = keyPair.getPublicKey().toString();
    const privateKey = keyPair.toString();

    // see apps/aigency-backend/src/user/user.rpc.controller.ts
    const callbackUrl = new URL(aigencyApiUrl);
    callbackUrl.pathname = '/api/user/login/' + publicKey;

    this._pendingLogins.set(publicKey, { userId, privateKey });

    const url = new URL('/login', walletUrl);
    url.searchParams.set('title', 'Xen Bot');
    url.searchParams.set('public_key', publicKey);
    url.searchParams.set('contract_id', nearLoginContractId);
    url.searchParams.set('success_url', callbackUrl.href);

    return {
      url: url.href,
    };
  }

  async finishLogin(loginId: string, nearAccountId: string) {
    const login = this._pendingLogins.get(loginId);

    if (!login) {
      throw new CodedRpcException('Invalid login ID');
    }

    const user = await this.userRepository.findOneByOrFail({
      id: login.userId,
    });

    user.nearAccountId = nearAccountId;
    user.privateKey = login.privateKey;

    await this.userRepository.save(user);

    const tgBotInfo = await this.bot.telegram.getMe();

    this._pendingLogins.delete(loginId);

    // ToDo: claim rewards

    return {
      redirectUrl: `https://t.me/${tgBotInfo.username}?startapp`,
    };
  }

  async createUser(createUserDto: { username: string | null; id: number }) {
    const user = this.userRepository.create({
      id: createUserDto.id,
      username: createUserDto.username?.toLowerCase(),
      status: true, // ToDo: remove?
    });

    await this.userRepository.insert(user);

    this.eventEmitter.emit('user.created', new UserCreatedEvent(user.id));

    return user.toDto();
  }

  async deleteUser(userId: number) {
    const user = await this.userRepository.findOneByOrFail({ id: userId });

    await this.userRepository.delete(userId);

    this.eventEmitter.emit('user.deleted', new UserDeletedEvent(user.id));
  }

  // ToDo: move to near service?
  private async _getBalance(accountId: string) {
    const url = this.configService.get<string>('NEAR_NODE_URL')!;

    const provider = new JsonRpcProvider({ url });

    const account = new Account(accountId, provider);
    const accountBalance = await account.getBalance();

    return accountBalance;
  }
}
