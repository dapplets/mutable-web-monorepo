import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from './subscription.repository';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async getSubscriptions(
    userId: number,
    limit: number,
    offset: number,
    onlyActive?: boolean,
  ) {
    const [items, total] = await this.subscriptionRepository.findAndCount({
      where: { userId, isEnabled: onlyActive ? true : undefined },
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
        lastSeenPostTimestamp: item.lastSeenPostTimestamp,
      })),
    };
  }

  async enableSubscription(userId: number, id: number) {
    await this.subscriptionRepository.update(
      { userId, id },
      { isEnabled: true },
    );
  }

  async disableSubscription(userId: number, id: number) {
    await this.subscriptionRepository.update(
      { userId, id },
      { isEnabled: false },
    );
  }

  async addSubscription(
    userId: number,
    source: string,
    link: string,
    timestamp?: string,
  ) {
    const subscription = this.subscriptionRepository.create({
      userId,
      source,
      link,
      isEnabled: true,
      lastSeenPostTimestamp: timestamp ?? null,
    });

    // ToDo: check subscription link before save

    await this.subscriptionRepository.insert(subscription);

    return {
      id: subscription.id,
      source: subscription.source,
      link: subscription.link,
      isEnabled: subscription.isEnabled,
      lastSeenPostTimestamp: subscription.lastSeenPostTimestamp,
    };
  }

  async removeSubscription(userId: number, id: number) {
    await this.subscriptionRepository.delete({ userId, id });
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

  async setLastSeenPostTimestamp(
    userId: number,
    source: string,
    link: string,
    timestamp: string,
  ) {
    await this.subscriptionRepository.update(
      { userId, source, link },
      { lastSeenPostTimestamp: timestamp },
    );
  }
}
