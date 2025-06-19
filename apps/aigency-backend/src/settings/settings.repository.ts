import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Setting } from './setting.entity';

@Injectable()
export class SettingsRepository extends Repository<Setting> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(Setting, dataSource.manager);
  }

  async get(key: string) {
    const setting = await this.findOne({ where: { key } });
    return setting?.value;
  }

  async set(key: string, value: string) {
    await this.upsert({ key, value }, { conflictPaths: ['key'] });
  }

  async reset(key: string) {
    await this.dataSource.transaction(async (manager) => {
      const setting = await manager.findOneBy(Setting, { key });
      if (setting) {
        await manager.update(Setting, { key }, { value: setting.defaultValue });
      }
    });
  }
}
