import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { SubscriptionModule } from 'src/subscription';
import { ContextModule } from 'src/context';

@Module({
  imports: [SubscriptionModule, ContextModule],
  providers: [TelegramService],
  controllers: [TelegramController],
  exports: [TelegramService],
})
export class TelegramModule {}
