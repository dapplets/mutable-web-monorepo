import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Reward } from './reward.entity';

@Injectable()
export class RewardRepository extends Repository<Reward> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Reward, dataSource.manager);
  }

  public async getUnclaimedRewardsForUsageCaller(userId: number) {
    return (await this.query(
      `select rh.amount
      from reward_history rh 
      join usage_history uh on uh.id = rh.related_item_id and rh.related_item_type = 'usage-caller'
      where uh.caller_user_id = $1
        and rh.tx_hash is null
        and rh.amount != '0'`,
      [userId],
    )) as { amount: string }[];
  }

  public async getUnclaimedRewardsForBugs(userId: number) {
    return (await this.query(
      `select rh.amount
      from reward_history rh 
      join warning w on w.id = rh.related_item_id and rh.related_item_type = 'bug'
      where w.user_id = $1
        and rh.tx_hash is null
        and rh.amount != '0'`,
      [userId],
    )) as { amount: string }[];
  }

  public async getAllRewardsForUsageCaller(userId: number) {
    return (await this.query(
      `select rh.amount
      from reward_history rh 
      join usage_history uh on uh.id = rh.related_item_id and rh.related_item_type = 'usage-caller'
      where uh.caller_user_id = $1
        and rh.amount != '0'`,
      [userId],
    )) as { amount: string }[];
  }

  public async getAllRewardsForBugs(userId: number) {
    return (await this.query(
      `select rh.amount
      from reward_history rh 
      join warning w on w.id = rh.related_item_id and rh.related_item_type = 'bug'
      where w.user_id = $1
        and rh.amount != '0'`,
      [userId],
    )) as { amount: string }[];
  }
}
