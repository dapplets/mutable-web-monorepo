import { Injectable } from '@nestjs/common';
import { UsageRepository } from './usage.repository';

@Injectable()
export class UsageService {
  constructor(private readonly usageRepository: UsageRepository) {}

  async getUsageHistory(userId: number, limit: number, offset: number) {
    const [items, total] = await this.usageRepository.getUsageHistory(
      userId,
      limit,
      offset,
    );

    return {
      total,
      items,
    };
  }

  async getUnpaidUsagesForUsageCaller(userId: number) {
    return this.usageRepository.getUnpaidUsagesForUsageCaller(userId);
  }

  async getUnpaidUsagesForUsageOwner(userId: number) {
    return this.usageRepository.getUnpaidUsagesForUsageOwner(userId);
  }
}
