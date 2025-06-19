import { Update, Ctx, Command } from 'nestjs-telegraf';
import { TelegrafContext } from '../common/telegraf-context.interface';
import { SettingKey, SettingsService } from './settings.service';
import { UseFilters } from '@nestjs/common';
import { AllExceptionsFilter } from '../common/all-exceptions.filter';

@UseFilters(AllExceptionsFilter)
@Update()
export class SettingsBotController {
  constructor(private readonly settingsService: SettingsService) {}

  @Command('about')
  async about(@Ctx() ctx: TelegrafContext) {
    const about = await this.settingsService.get(SettingKey.About);

    if (!about) {
      await ctx.reply('Settings are not set');
      return;
    }

    await ctx.reply(about, { parse_mode: 'Markdown' });
  }
}
