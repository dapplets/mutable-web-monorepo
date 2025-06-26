import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { TelegrafContext } from 'src/common/telegraf-context.interface';
import { MemoryService } from 'src/memory/memory.service';
import { N8NService, WebhookEvent } from 'src/n8n/n8n.service';
import { UserService } from 'src/user/user.service';
import { Telegraf } from 'telegraf';

@Injectable()
export class BotService {
  constructor(
    private n8nService: N8NService,
    private userService: UserService,
    private memoryService: MemoryService,
    @InjectBot() private bot: Telegraf<TelegrafContext>,
  ) {}

  async processMessage(chatId: number | string, message: any): Promise<any> {
    await this.bot.telegram.sendChatAction(chatId, 'typing');

    const user = await this.userService.getUserById(Number(chatId)); // ToDo: fix types

    if (!user) {
      throw new Error('User not found');
    }

    const memories = await this.memoryService.getAllMemories(user.id);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = { user, memories, message };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.n8nService.callMainWorkflow(
      WebhookEvent.MessageReceived,
      request,
      user.isDeveloper,
    );

    return result;
  }

  async sendMessage(userId: number | string, text: string) {
    await this.bot.telegram.sendMessage(userId, text, {
      parse_mode: 'Markdown',
    });
  }

  async getFileUrl(fileId: string) {
    const url = await this.bot.telegram.getFileLink(fileId);
    return { url };
  }

  async getCurrentBotInfo() {
    const info = await this.bot.telegram.getMe();
    return {
      username: info.username,
      id: info.id,
    };
  }
}
