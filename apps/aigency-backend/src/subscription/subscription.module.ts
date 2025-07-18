import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './subscription.entity';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { TelegramModule } from 'src/grabbers/telegram';
import { RedditModule } from 'src/grabbers/reddit';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    forwardRef(() => TelegramModule),
    forwardRef(() => RedditModule),
  ],
  providers: [SubscriptionRepository, SubscriptionService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
