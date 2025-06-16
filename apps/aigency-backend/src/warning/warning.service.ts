import { Injectable } from '@nestjs/common';
import { WarningRepository } from './warning.repository';

@Injectable()
export class WarningService {
  constructor(private readonly warningRepository: WarningRepository) {}

  async getWarnings(username: string, limit: number, offset: number) {
    const [items, total] = await this.warningRepository.findAndCount({
      where: { username, isDeleted: false },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      total,
      items: items.map((item) => item.toDto()),
    };
  }

  async deleteAllWarnings(username: string) {
    await this.warningRepository.update({ username }, { isDeleted: true });
  }
}
