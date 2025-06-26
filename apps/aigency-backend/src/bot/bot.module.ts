import { Module } from '@nestjs/common';
import { BotBotController } from './bot.bot.controller';
import { N8NModule } from 'src/n8n';
import { BotService } from './bot.service';
import { BotRpcController } from './bot.rpc.controller';
import { UserModule } from 'src/user';
import { MemoryModule } from 'src/memory';

@Module({
  providers: [BotBotController, BotService],
  imports: [N8NModule, UserModule, MemoryModule],
  controllers: [BotRpcController],
  exports: [BotService],
})
export class BotModule {}
