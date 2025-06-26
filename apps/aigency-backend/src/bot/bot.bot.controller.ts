import { Update, On, Message, Ctx } from 'nestjs-telegraf';
import { Logger, UseFilters } from '@nestjs/common';
import { AllExceptionsFilter } from '../common/all-exceptions.filter';
import { BotService } from './bot.service';
import { TelegrafContext } from 'src/common/telegraf-context.interface';

@UseFilters(AllExceptionsFilter)
@Update()
export class BotBotController {
  private readonly logger = new Logger(BotBotController.name);

  constructor(private botService: BotService) {}

  @On('message')
  async onMessage(
    @Message() message: any,
    @Ctx() ctx: TelegrafContext,
  ): Promise<string | undefined> {
    if (!ctx.chat?.id) {
      return 'Chat ID not found';
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      await this.botService.processMessage(ctx.chat.id, message);
    } catch (error) {
      this.logger.error(error);

      return 'Error processing message. There is probably no connection to N8N.';
    }
  }
}
