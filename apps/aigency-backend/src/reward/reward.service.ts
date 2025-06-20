import { Injectable } from '@nestjs/common';
import { RewardRepository } from './reward.repository';
import { UsageService } from 'src/usage/usage.service';
import { WarningService } from 'src/warning/warning.service';
import { CapabilityService } from 'src/capability/capability.service';
import { NearService } from 'src/near/near.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RewardSucceedEvent } from './reward-succeed.event';
import { RewardFailedEvent } from './reward-failed.event';

@Injectable()
export class RewardService {
  constructor(
    private readonly rewardRepository: RewardRepository,
    private readonly usageService: UsageService,
    private readonly warningService: WarningService,
    private readonly capabilityService: CapabilityService,
    private readonly nearService: NearService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getRewardAmount(username: string) {
    const [
      unclaimedRewardsForUsageCaller,
      unclaimedRewardsForBugs,
      allRewardsForUsageCaller,
      allRewardsForBugs,
    ] = await Promise.all([
      this.rewardRepository.getUnclaimedRewardsForUsageCaller(username),
      this.rewardRepository.getUnclaimedRewardsForBugs(username),
      this.rewardRepository.getAllRewardsForUsageCaller(username),
      this.rewardRepository.getAllRewardsForBugs(username),
    ]);

    const sumBigInts = (...arr: { amount: string }[][]) =>
      arr.flat(1).reduce((acc, cur) => BigInt(cur.amount) + acc, BigInt(0));

    const availableToClaim = sumBigInts(
      unclaimedRewardsForUsageCaller,
      unclaimedRewardsForBugs,
    ).toString();

    const totalRewards = sumBigInts(
      allRewardsForUsageCaller,
      allRewardsForBugs,
    ).toString();

    return {
      availableToClaim,
      totalRewards,
    };
  }

  async proceedAllUserRewards(username: string) {
    await this._rewardAgentOwner(username);
    await this._rewardAgentCaller(username);
    await this._rewardBugHunter(username);
  }

  private async _rewardAgentOwner(username: string) {
    const rewardAmount = this.configService.get<string>('USAGE_REWARD_AMOUNT')!;

    const unpaidUsages =
      await this.usageService.getUnpaidUsagesForUsageOwner(username);

    for (const usage of unpaidUsages) {
      const capability =
        await this.capabilityService.getOrMintCapabilityWithNft(
          usage.capabilityId,
          username,
        );

      if (!capability.beneficiaryAccountId) {
        throw new Error('Beneficiary account not found');
      }

      // ToDo: add business logic to check if reward is needed

      await this._reward(
        capability.beneficiaryAccountId,
        BigInt(rewardAmount),
        usage.capabilityId,
        'usage-owner', // ToDo: magic value
        username,
      );
    }
  }

  private async _rewardAgentCaller(username: string) {
    const user = await this.userService.getUserByUsername(username);

    if (!user?.nearAccountId) {
      throw new Error('User is not logged in');
    }

    const rewardAmount = this.configService.get<string>('USAGE_REWARD_AMOUNT')!;

    const unpaidUsages =
      await this.usageService.getUnpaidUsagesForUsageCaller(username);

    for (const usage of unpaidUsages) {
      // ToDo: add business logic to check if reward is needed

      await this._reward(
        user.nearAccountId,
        BigInt(rewardAmount),
        usage.id,
        'usage-caller', // ToDo: magic value
        username,
      );
    }
  }

  private async _rewardBugHunter(username: string) {
    const user = await this.userService.getUserByUsername(username);

    if (!user?.nearAccountId) {
      throw new Error('User is not logged in');
    }

    const rewardAmount = this.configService.get<string>('BUG_REWARD_AMOUNT')!;

    const unpaidWarnings =
      await this.warningService.getUnpaidWarnings(username);

    for (const warning of unpaidWarnings) {
      // ToDo: add business logic to check if reward is needed

      await this._reward(
        user.nearAccountId,
        BigInt(rewardAmount),
        warning.id,
        'bug', // ToDo: magic value
        username,
      );
    }
  }

  private async _reward(
    recipientAccountId: string,
    amount: bigint,
    relatedItemId: string,
    relatedItemType: string,
    callerUsername: string,
  ) {
    let txHash: string | null = null;

    if (amount !== BigInt(0)) {
      const privateKey = this.configService.get<string>(
        'REWARD_ACCOUNT_PRIVATE_KEY',
      )!;

      const fundAccountId =
        this.configService.get<string>('REWARD_ACCOUNT_ID')!;

      try {
        const receipt = await this.nearService.transfer(
          privateKey,
          fundAccountId,
          recipientAccountId,
          amount,
        );
        txHash = receipt.transaction_outcome.id;

        this.eventEmitter.emit(
          'reward.succeed',
          new RewardSucceedEvent(recipientAccountId, txHash, callerUsername),
        );
      } catch (error) {
        console.log(error);

        this.eventEmitter.emit(
          'reward.failed',
          new RewardFailedEvent(recipientAccountId, callerUsername),
        );

        // do not insert reward receipt
        return;
      }
    }

    await this.rewardRepository.insert({
      recipientAccountId,
      amount: amount.toString(),
      txHash,
      relatedItemType,
      relatedItemId,
    });
  }
}
