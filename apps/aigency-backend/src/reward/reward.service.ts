import { Injectable } from '@nestjs/common';
import { RewardRepository } from './reward.repository';

@Injectable()
export class RewardService {
  constructor(private readonly rewardRepository: RewardRepository) {}

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
}
