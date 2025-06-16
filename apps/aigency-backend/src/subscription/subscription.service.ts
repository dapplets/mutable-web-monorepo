import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from './subscription.repository';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async getSubscriptions(username: string, limit: number, offset: number) {
    const [items, total] = await this.subscriptionRepository.findAndCount({
      where: { username },
      order: { id: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      total,
      items: items.map((item) => ({
        id: item.id,
        source: item.source,
        link: item.link,
        isEnabled: item.isEnabled,
      })),
    };
  }

  async enableSubscription(username: string, id: number) {
    await this.subscriptionRepository.update(
      { username, id },
      { isEnabled: true },
    );
  }

  async disableSubscription(username: string, id: number) {
    await this.subscriptionRepository.update(
      { username, id },
      { isEnabled: false },
    );
  }

  async addSubscription(
    username: string,
    userId: string,
    source: string,
    link: string,
  ) {
    const subscription = this.subscriptionRepository.create({
      username,
      userId,
      source,
      link,
      isEnabled: true,
    });

    await this.subscriptionRepository.insert(subscription);

    return {
      id: subscription.id,
      source: subscription.source,
      link: subscription.link,
      isEnabled: subscription.isEnabled,
    };
  }
}
