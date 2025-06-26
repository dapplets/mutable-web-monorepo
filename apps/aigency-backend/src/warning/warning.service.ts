import { Injectable } from '@nestjs/common';
import { WarningRepository } from './warning.repository';

@Injectable()
export class WarningService {
  constructor(private readonly warningRepository: WarningRepository) {}

  async getWarnings(userId: number, limit: number, offset: number) {
    const [items, total] = await this.warningRepository.findAndCount({
      where: { userId, isDeleted: false },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      total,
      items: items.map((item) => item.toDto()),
    };
  }

  async deleteAllWarnings(userId: number) {
    await this.warningRepository.update({ userId }, { isDeleted: true });
  }

  async getUnpaidWarnings(userId: number) {
    return this.warningRepository.getUnpaidWarnings(userId);
  }
}
