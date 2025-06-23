import { Injectable } from '@nestjs/common';
import { MemoryRepository } from './memory.repository';

@Injectable()
export class MemoryService {
  constructor(private readonly memoryRepository: MemoryRepository) {}

  async getMemories(username: string, limit: number, offset: number) {
    this._validateUsername(username);

    const [items, total] = await this.memoryRepository.findAndCount({
      where: { username },
      order: { id: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      total,
      items: items.map((item) => item.toDto()),
    };
  }

  async deleteAllMemories(username: string) {
    this._validateUsername(username);
    await this.memoryRepository.delete({ username });
  }

  async deleteMemory(username: string, id: number) {
    this._validateUsername(username);
    await this.memoryRepository.delete({ username, id });
  }

  private _validateUsername(username: string) {
    // prevents SQL injection
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Invalid username');
    }
  }
}
