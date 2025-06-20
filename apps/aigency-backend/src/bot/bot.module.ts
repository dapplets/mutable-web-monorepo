import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';

@Module({
  providers: [BotController],
})
export class BotModule {}
