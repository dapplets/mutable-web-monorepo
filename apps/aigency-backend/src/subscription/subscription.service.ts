import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from './subscription.repository';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async getSubscriptions(props: {
    userId?: number;
    source?: string;
    limit: number;
    offset: number;
    onlyActive?: boolean;
  }) {
    const { userId, limit, offset, onlyActive, source } = props;
    const [items, total] = await this.subscriptionRepository.findAndCount({
      where: { userId, isEnabled: onlyActive ? true : undefined, source },
      order: { id: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      total,
      items: items.map((item) => ({
        ...item,
        evaluations: item.evaluations?.map(Number),
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

  async addSubscription(props: {
    userId: number;
    source: string;
    link: string;
    timestamp?: string;
    isByFinder: boolean;
  }) {
    const { userId, source, link, timestamp, isByFinder } = props;
    const subscription = this.subscriptionRepository.create({
      userId,
      source,
      link,
      isEnabled: true,
      lastSeenPostTimestamp: timestamp ?? null,
      isByFinder,
    });

    // ToDo: check subscription link before save

    await this.subscriptionRepository.insert(subscription);

    return {
      id: subscription.id,
      source: subscription.source,
      link: subscription.link,
      isEnabled: subscription.isEnabled,
      lastSeenPostTimestamp: subscription.lastSeenPostTimestamp,
      isByFinder: subscription.isByFinder,
      evaluations: subscription.evaluations,
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

  async addEvaluation(entityId: number, newValue: number): Promise<void> {
    await this.subscriptionRepository.addEvaluation(entityId, newValue);
  }

  /** Read all 10 values in the order they were added (newest first). */
  async getEvaluations(entityId: number): Promise<number[] | undefined> {
    const row = await this.subscriptionRepository.findOneByOrFail({
      id: entityId,
    });
    return row.evaluations?.map(Number);
  }

  async setIsByFinder(entityId: number, isByFinder: boolean): Promise<void> {
    await this.subscriptionRepository.update({ id: entityId }, { isByFinder });
  }
}
