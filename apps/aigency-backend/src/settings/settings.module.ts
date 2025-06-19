import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './setting.entity';
import { SettingsRepository } from './settings.repository';
import { SettingsService } from './settings.service';
import { SettingsBotController } from './settings.bot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  providers: [SettingsBotController, SettingsRepository, SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
