import { Update, Ctx, Start, Command } from 'nestjs-telegraf';
import { TelegrafContext } from '../common/telegraf-context.interface';
import { UserService } from './user.service';
import { WelcomeMessage } from './user.bot.messages';
import { UseFilters } from '@nestjs/common';
import { AllExceptionsFilter } from '../common/all-exceptions.filter';

@UseFilters(AllExceptionsFilter)
@Update()
export class UserBotController {
  constructor(private readonly userService: UserService) {}

  @Start()
  async start(@Ctx() ctx: TelegrafContext) {
    if (!ctx.from?.id) {
      await ctx.reply('You must have an ID to use this bot');
      return;
    }

    const user = await this.userService.getUserById(ctx.from.id);

    if (!user) {
      await this.userService.createUser({
        username: ctx.from.username ?? null,
        id: ctx.from.id,
      });
    }

    await ctx.reply(WelcomeMessage({ username: ctx.from.username }), {
      parse_mode: 'Markdown',
    });
  }

  @Command('wipe')
  async wipe(@Ctx() ctx: TelegrafContext) {
    if (!ctx.from?.id) {
      throw new Error('User ID not found');
    }

    const user = await this.userService.getUserById(ctx.from.id);

    if (user) {
      await this.userService.deleteUser(ctx.from.id);
    }

    await ctx.reply('Your account has been deleted');
  }

  @Command('throw')
  throw() {
    throw new Error('Test error');
  }
}
