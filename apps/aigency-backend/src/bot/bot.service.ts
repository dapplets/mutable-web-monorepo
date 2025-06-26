import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { TelegrafContext } from 'src/common/telegraf-context.interface';
import { MemoryService } from 'src/memory/memory.service';
import { N8NService, WebhookEvent } from 'src/n8n/n8n.service';
import { SettingKey, SettingsService } from 'src/settings/settings.service';
import { UserService } from 'src/user/user.service';
import { Telegraf } from 'telegraf';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    private n8nService: N8NService,
    private userService: UserService,
    private memoryService: MemoryService,
    private settingsService: SettingsService,
    @InjectBot() private bot: Telegraf<TelegrafContext>,
  ) {}

  async processMessage(
    chatId: number | string,
    username: string | undefined,
    message: any,
  ): Promise<any> {
    await this.bot.telegram.sendChatAction(chatId, 'typing');

    let user = await this.userService.getUserById(Number(chatId)); // ToDo: fix types

    if (!user) {
      user = await this.userService.createUser({
        username: username ?? null,
        id: Number(chatId),
      });
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

  async initializeBot() {
    const isBotInitialized = await this.settingsService.get(
      SettingKey.IsBotInitialized,
    );

    if (isBotInitialized === 'true') {
      this.logger.log('Telegram Bot is already initialized. Skipping...');
      return;
    }

    await this.bot.telegram.setMyName('Your Xen');
    await this.bot.telegram.setMyDescription(
      'Xen is a locally running, privacy-focused AI assistant designed to integrate seamlessly into your digital life. Built by a global community of developers and privacy advocates, Xen isn’t just another chatbot — it’s your trusted co-pilot in the age of intelligent automation. https://myxen.ai',
    );
    await this.bot.telegram.setMyShortDescription(
      'Powerful personal AI assistant in your pocket',
    );

    await this.settingsService.set(SettingKey.IsBotInitialized, 'true');

    this.logger.log('New Telegram bot is initialized successfully');
  }
}
