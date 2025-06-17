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

    // ToDo: check subscription link before save

    await this.subscriptionRepository.insert(subscription);

    return {
      id: subscription.id,
      source: subscription.source,
      link: subscription.link,
      isEnabled: subscription.isEnabled,
    };
  }

  async removeSubscription(username: string, id: number) {
    await this.subscriptionRepository.delete({ username, id });
  }

  getNextScanOfSubscriptions() {
    const date = new Date();

    // every 1h at 2nd minute
    const EVERY_HOURS = 1;
    const AT_PAST_MINUTES = 2;

    date.setSeconds(0, 0);

    if (date.getMinutes() >= AT_PAST_MINUTES) {
      date.setHours(date.getHours() + EVERY_HOURS);
    }

    date.setMinutes(AT_PAST_MINUTES);

    return {
      nextScanAt: date.toISOString(),
    };
  }
}
