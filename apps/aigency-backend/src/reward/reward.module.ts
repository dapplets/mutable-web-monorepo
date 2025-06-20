import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from './reward.entity';
import { RewardRepository } from './reward.repository';
import { RewardService } from './reward.service';
import { RewardController } from './reward.controller';
import { WarningModule } from 'src/warning';
import { UsageModule } from 'src/usage';
import { SettingsModule } from 'src/settings';
import { NearModule } from 'src/near';
import { UserModule } from 'src/user';
import { CapabilityModule } from 'src/capability';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reward]),
    WarningModule,
    UsageModule,
    SettingsModule,
    NearModule,
    UserModule,
    CapabilityModule,
  ],
  providers: [RewardRepository, RewardService],
  controllers: [RewardController],
})
export class RewardModule {}
