import { Injectable } from '@nestjs/common';
import { UsageRepository } from './usage.repository';

@Injectable()
export class UsageService {
  constructor(private readonly usageRepository: UsageRepository) {}

  async getUsageHistory(username: string, limit: number, offset: number) {
    const [items, total] = await this.usageRepository.getUsageHistory(
      username,
      limit,
      offset,
    );

    return {
      total,
      items,
    };
  }

  async getUnpaidUsagesForUsageCaller(username: string) {
    return this.usageRepository.getUnpaidUsagesForUsageCaller(username);
  }

  async getUnpaidUsagesForUsageOwner(username: string) {
    return this.usageRepository.getUnpaidUsagesForUsageOwner(username);
  }
}
