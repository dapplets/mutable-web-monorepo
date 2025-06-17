import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Account } from '@near-js/accounts';
import { JsonRpcProvider } from '@near-js/providers';
import { ConfigService } from '@nestjs/config';
import { formatNearAmount } from '@near-js/utils';
import { CodedRpcException } from '@dapplets/openrpc-nestjs-json-rpc';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async getUserById(id: number) {
    const user = await this.userRepository.findOneByOrFail({ id });
    return user.toDto();
  }

  async getUserByUsername(username: string) {
    const user = await this.userRepository.findOneByOrFail({ username });
    return user.toDto();
  }

  async getBalance(id: number) {
    const user = await this.userRepository.findOneByOrFail({ id });

    if (!user.nearAccountId) {
      throw new CodedRpcException('User is not logged in');
    }

    const balance = await this._getBalance(user.nearAccountId);

    return {
      balance: balance.toString(),
      formatted: formatNearAmount(balance.toString(), 4),
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

  private async _getBalance(accountId: string) {
    const url = this.configService.get<string>('NEAR_NODE_URL')!;

    const provider = new JsonRpcProvider({ url });

    const account = new Account(accountId, provider);
    const accountBalance = await account.getBalance();

    return accountBalance;
  }
}
