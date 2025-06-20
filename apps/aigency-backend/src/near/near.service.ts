import { KeyPair, KeyPairString } from '@near-js/crypto';
import { InMemoryKeyStore } from '@near-js/keystores';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Contract } from 'near-api-js';

@Injectable()
export class NearService {
  constructor(private configService: ConfigService) {}

  async transfer(
    privateKey: string,
    senderId: string,
    recipientId: string,
    amount: bigint,
  ) {
    const account = await this._prepareAccount(privateKey, senderId);

    const result = await account.sendMoney(recipientId, amount);

    return result;
  }

  async viewContractCall(
    contractId: string,
    methodName: string,
    methodArgs: any,
  ) {
    const config = this._getNetworkConfig();
    const near = await connect(config);
    const contract = new Contract(near.connection, contractId, {
      viewMethods: [methodName],
      changeMethods: [],
      useLocalViewExecution: false,
    });

    // @ts-expect-error poor types
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = await contract[methodName](methodArgs);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }

  async writeContractCall(
    privateKey: string,
    senderId: string,
    contractId: string,
    methodName: string,
    methodArgs: any,
    attachedDeposit: bigint,
  ) {
    const account = await this._prepareAccount(privateKey, senderId);

    const result = await account.functionCall({
      contractId,
      methodName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      args: methodArgs,
      attachedDeposit: attachedDeposit,
    });

    return result;
  }

  private async _prepareAccount(privateKey: string, senderId: string) {
    const config = this._getNetworkConfig();

    const keyPair = KeyPair.fromString(privateKey as KeyPairString);
    const keyStore = new InMemoryKeyStore();

    await keyStore.setKey(config.networkId, senderId, keyPair);

    const near = await connect({
      ...config,
      keyStore,
      deps: { keyStore },
    });

    const account = await near.account(senderId);
    return account;
  }

  private _getNetworkConfig() {
    const networkId = this.configService.get<string>('NEAR_NETWORK_ID')!;
    const nodeUrl = this.configService.get<string>('NEAR_NODE_URL')!;
    const walletUrl = this.configService.get<string>('NEAR_WALLET_URL')!;
    const helperUrl = this.configService.get<string>('NEAR_HELPER_URL')!;

    return {
      networkId,
      nodeUrl,
      walletUrl,
      helperUrl,
    };
  }
}
