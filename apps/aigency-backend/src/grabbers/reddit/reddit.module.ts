import { Module } from '@nestjs/common';
import { RedditService } from './reddit.service';
import { RedditController } from './reddit.controller';
import { SubscriptionModule } from 'src/subscription';
import { ContextModule } from 'src/context';

@Module({
  imports: [SubscriptionModule, ContextModule],
  providers: [RedditService],
  controllers: [RedditController],
  exports: [RedditService],
})
export class RedditModule {}
