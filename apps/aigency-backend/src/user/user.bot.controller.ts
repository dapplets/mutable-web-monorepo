import { Update, Ctx, Start, Command } from 'nestjs-telegraf';
import { TelegrafContext } from '../common/telegraf-context.interface';
import { UserService } from './user.service';
import { WelcomeMessage } from './user.bot.messages';

@Update()
export class UserBotController {
  constructor(private readonly userService: UserService) {}

  @Start()
  async start(@Ctx() ctx: TelegrafContext) {
    if (!ctx.from?.username) {
      await ctx.reply('You must have a username to use this bot');
      return;
    }

    const user = await this.userService.getUserByUsername(ctx.from.username);

    if (!user) {
      await this.userService.createUser({
        username: ctx.from.username,
        id: ctx.from.id,
      });
    }

    await ctx.reply(WelcomeMessage({ username: ctx.from.username }), {
      parse_mode: 'Markdown',
    });
  }

  @Command('wipe')
  async wipe(@Ctx() ctx: TelegrafContext) {
    if (!ctx.from?.username) {
      await ctx.reply('You must have a username to use this bot');
      return;
    }

    const user = await this.userService.getUserByUsername(ctx.from.username);

    if (user) {
      await this.userService.deleteUser(ctx.from.id);
    }

    await ctx.reply('Your account has been deleted');
  }
}
