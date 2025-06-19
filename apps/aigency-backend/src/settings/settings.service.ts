import { Injectable } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';

export enum SettingKey {
  About = 'about',
}

@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async get(key: SettingKey) {
    return this.settingsRepository.get(key);
  }

  async set(key: SettingKey, value: string) {
    return this.settingsRepository.set(key, value);
  }

  async reset(key: SettingKey) {
    return this.settingsRepository.reset(key);
  }
}
