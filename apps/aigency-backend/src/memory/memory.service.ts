import { Injectable } from '@nestjs/common';
import { MemoryRepository } from './memory.repository';

@Injectable()
export class MemoryService {
  constructor(private readonly memoryRepository: MemoryRepository) {}

  async getMemories(username: string, limit: number, offset: number) {
    const [items, total] = await this.memoryRepository.getMemories(
      username,
      limit,
      offset,
    );

    return {
      total,
      items: items.map((item) => item.toDto()),
    };
  }
}
