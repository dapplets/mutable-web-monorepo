import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Reward } from './reward.entity';

@Injectable()
export class RewardRepository extends Repository<Reward> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Reward, dataSource.manager);
  }

  public async getUnclaimedRewardsForUsageCaller(username: string) {
    return (await this.query(
      `select rh.amount
      from "default".reward_history rh 
      join "default".usage_history uh on uh.id = rh.related_item_id and rh.related_item_type = 'usage-caller'
      where uh.caller_username = $1
        and rh.tx_hash is null
        and rh.amount != '0'`,
      [username],
    )) as { amount: string }[];
  }

  public async getUnclaimedRewardsForBugs(username: string) {
    return (await this.query(
      `select rh.amount
      from "default".reward_history rh 
      join "default".warning w on w.id = rh.related_item_id and rh.related_item_type = 'bug'
      where w.username = $1
        and rh.tx_hash is null
        and rh.amount != '0'`,
      [username],
    )) as { amount: string }[];
  }

  public async getAllRewardsForUsageCaller(username: string) {
    return (await this.query(
      `select rh.amount
      from "default".reward_history rh 
      join "default".usage_history uh on uh.id = rh.related_item_id and rh.related_item_type = 'usage-caller'
      where uh.caller_username = $1
        and rh.amount != '0'`,
      [username],
    )) as { amount: string }[];
  }

  public async getAllRewardsForBugs(username: string) {
    return (await this.query(
      `select rh.amount
      from "default".reward_history rh 
      join "default".warning w on w.id = rh.related_item_id and rh.related_item_type = 'bug'
      where w.username = $1
        and rh.amount != '0'`,
      [username],
    )) as { amount: string }[];
  }
}
