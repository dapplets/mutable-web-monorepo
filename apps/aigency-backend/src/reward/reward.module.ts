import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from './reward.entity';
import { RewardRepository } from './reward.repository';
import { RewardService } from './reward.service';
import { RewardController } from './reward.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reward])],
  providers: [RewardRepository, RewardService],
  controllers: [RewardController],
})
export class RewardModule {}
