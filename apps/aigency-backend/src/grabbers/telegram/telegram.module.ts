import { forwardRef, Module } from '@nestjs/common';
import { ContextModule } from 'src/context';
import { FinderModule } from 'src/finder';
import { SubscriptionModule } from 'src/subscription';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Module({
  imports: [forwardRef(() => SubscriptionModule), ContextModule, FinderModule],
  providers: [TelegramService],
  controllers: [TelegramController],
  exports: [TelegramService],
})
export class TelegramModule {}
