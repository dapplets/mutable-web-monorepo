import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { TelegrafContext } from 'src/common/telegraf-context.interface';
import { MemoryService } from 'src/memory/memory.service';
import { N8NService } from 'src/n8n/n8n.service';
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
    const result = await this.n8nService.callMainWorkflow(request);

    return result;
  }

  async sendMessage(chatId: number | string, text: string) {
    await this.bot.telegram.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
    });
  }
}
