import { Module } from '@nestjs/common';
import { BotBotController } from './bot.bot.controller';
import { N8NModule } from 'src/n8n';
import { BotService } from './bot.service';
import { BotRpcController } from './bot.rpc.controller';
import { UserModule } from 'src/user';
import { MemoryModule } from 'src/memory';
import { SettingsModule } from 'src/settings';

@Module({
  providers: [BotBotController, BotService],
  imports: [N8NModule, UserModule, MemoryModule, SettingsModule],
  controllers: [BotRpcController],
  exports: [BotService],
})
export class BotModule {
  constructor(private botService: BotService) {}

  async onModuleInit() {
    await this.botService.initializeBot();
  }
}
