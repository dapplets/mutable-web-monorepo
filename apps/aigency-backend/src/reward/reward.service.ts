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

  async getRewardAmount(userId: number) {
    const [
      unclaimedRewardsForUsageCaller,
      unclaimedRewardsForBugs,
      allRewardsForUsageCaller,
      allRewardsForBugs,
    ] = await Promise.all([
      this.rewardRepository.getUnclaimedRewardsForUsageCaller(userId),
      this.rewardRepository.getUnclaimedRewardsForBugs(userId),
      this.rewardRepository.getAllRewardsForUsageCaller(userId),
      this.rewardRepository.getAllRewardsForBugs(userId),
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

  async proceedAllUserRewards(userId: number) {
    await this._rewardAgentOwner(userId);
    await this._rewardAgentCaller(userId);
    await this._rewardBugHunter(userId);
  }

  private async _rewardAgentOwner(userId: number) {
    const rewardAmount = this.configService.get<string>('USAGE_REWARD_AMOUNT')!;

    const unpaidUsages =
      await this.usageService.getUnpaidUsagesForUsageOwner(userId);

    for (const usage of unpaidUsages) {
      const capability =
        await this.capabilityService.getOrMintCapabilityWithNft(
          usage.capabilityId,
          userId,
        );

      if (!capability.beneficiaryAccountId) {
        console.warn('Beneficiary account is not found. Skip reward.');
        return;
      }

      // ToDo: add business logic to check if reward is needed

      await this._reward(
        capability.beneficiaryAccountId,
        BigInt(rewardAmount),
        usage.capabilityId,
        'usage-owner', // ToDo: magic value
        userId,
      );
    }
  }

  private async _rewardAgentCaller(userId: number) {
    const user = await this.userService.getUserById(userId);

    if (!user?.nearAccountId) {
      throw new Error('User is not logged in');
    }

    const rewardAmount = this.configService.get<string>('USAGE_REWARD_AMOUNT')!;

    const unpaidUsages =
      await this.usageService.getUnpaidUsagesForUsageCaller(userId);

    for (const usage of unpaidUsages) {
      // ToDo: add business logic to check if reward is needed

      await this._reward(
        user.nearAccountId,
        BigInt(rewardAmount),
        usage.id,
        'usage-caller', // ToDo: magic value
        userId,
      );
    }
  }

  private async _rewardBugHunter(userId: number) {
    const user = await this.userService.getUserById(userId);

    if (!user?.nearAccountId) {
      throw new Error('User is not logged in');
    }

    const rewardAmount = this.configService.get<string>('BUG_REWARD_AMOUNT')!;

    const unpaidWarnings = await this.warningService.getUnpaidWarnings(userId);

    for (const warning of unpaidWarnings) {
      // ToDo: add business logic to check if reward is needed

      await this._reward(
        user.nearAccountId,
        BigInt(rewardAmount),
        warning.id,
        'bug', // ToDo: magic value
        userId,
      );
    }
  }

  private async _reward(
    recipientAccountId: string,
    amount: bigint,
    relatedItemId: string,
    relatedItemType: string,
    callerUserId: number,
  ) {
    let txHash: string | null = null;

    if (amount !== BigInt(0)) {
      const privateKey = this.configService.get<string | null>(
        'REWARD_ACCOUNT_PRIVATE_KEY',
      );

      const fundAccountId = this.configService.get<string | null>(
        'REWARD_ACCOUNT_ID',
      );

      if (!privateKey || !fundAccountId) {
        console.warn(
          'Rewards are disabled. Set REWARD_ACCOUNT_PRIVATE_KEY and REWARD_ACCOUNT_ID to enable.',
        );
        return;
      }

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
          new RewardSucceedEvent(recipientAccountId, txHash, callerUserId),
        );
      } catch (error) {
        console.log(error);

        this.eventEmitter.emit(
          'reward.failed',
          new RewardFailedEvent(recipientAccountId, callerUserId),
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
