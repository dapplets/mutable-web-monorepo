import { Injectable } from '@nestjs/common';
import { MemoryRepository } from './memory.repository';

@Injectable()
export class MemoryService {
  constructor(private readonly memoryRepository: MemoryRepository) {}

  async getMemories(userId: number, limit: number, offset: number) {
    const [items, total] = await this.memoryRepository.findAndCount({
      where: { userId },
      order: { id: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      total,
      items: items.map((item) => item.toDto()),
    };
  }

  async getAllMemories(userId: number) {
    return this.memoryRepository.find({
      where: { userId },
      order: { id: 'DESC' }, // last memories first for next ai agent prompt
    });
  }

  async deleteAllMemories(userId: number) {
    await this.memoryRepository.delete({ userId });
  }

  async deleteMemory(userId: number, id: number) {
    await this.memoryRepository.delete({ userId, id });
  }
}
