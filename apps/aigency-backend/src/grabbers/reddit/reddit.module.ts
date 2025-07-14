import { Module } from '@nestjs/common';
import { ContextModule } from 'src/context';
import { FinderModule } from 'src/finder';
import { SubscriptionModule } from 'src/subscription';
import { RedditController } from './reddit.controller';
import { RedditService } from './reddit.service';

@Module({
  imports: [SubscriptionModule, ContextModule, FinderModule],
  providers: [RedditService],
  controllers: [RedditController],
  exports: [RedditService],
})
export class RedditModule {}
