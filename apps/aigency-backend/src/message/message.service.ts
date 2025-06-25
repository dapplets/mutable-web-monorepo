import { Injectable } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { StoredAigencyMessageData } from './message.entity';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async addMessage(
    userId: number,
    message: {
      message: StoredAigencyMessageData;
      sessionId: string;
    },
  ): Promise<void> {
    await this.messageRepository.insert({
      // @ts-expect-error poor types
      message: message.message,
      userId: userId,
      sessionId: message.sessionId,
    });
  }

  async getMessages(
    userId: number,
    sessionId: string,
    limit: number,
    offset: number,
  ) {
    const [items, total] = await this.messageRepository.findAndCount({
      where: { userId, sessionId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      items: items.map((message) => ({
        id: message.id,
        message: message.message,
        createdAt: message.createdAt,
      })),
      total,
    };
  }

  async deleteMessages(userId: number, sessionId: string): Promise<void> {
    await this.messageRepository.delete({ userId, sessionId });
  }
}
