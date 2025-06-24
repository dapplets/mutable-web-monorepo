import { Update, On, Message, Ctx } from 'nestjs-telegraf';
import { UseFilters } from '@nestjs/common';
import { AllExceptionsFilter } from '../common/all-exceptions.filter';
import { BotService } from './bot.service';
import { TelegrafContext } from 'src/common/telegraf-context.interface';

@UseFilters(AllExceptionsFilter)
@Update()
export class BotBotController {
  constructor(private botService: BotService) {}

  @On('message')
  async onMessage(
    @Message() message: any,
    @Ctx() ctx: TelegrafContext,
  ): Promise<string> {
    if (!ctx.chat?.id) {
      return JSON.stringify({ error: 'Chat id not found' });
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await this.botService.processMessage(ctx.chat.id, message);
      if (typeof result === 'string') {
        return result;
      }
      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify(error);
    }
  }
}
