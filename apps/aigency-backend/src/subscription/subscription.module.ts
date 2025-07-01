import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './subscription.entity';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription])],
  providers: [
    SubscriptionRepository,
    SubscriptionRepository, // ToDo: remove?
    SubscriptionService,
  ],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
