import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FinderRepository } from './finder.repository';
import { UserCreatedEvent } from 'src/user/user-created.event';
import { UserDeletedEvent } from 'src/user/user-deleted.event';

@Injectable()
export class FinderService {
  constructor(private readonly finderRepository: FinderRepository) {}

  async getActiveFinders() {
    return this.finderRepository
      .find({
        where: { isEnabled: true },
        order: { id: 'DESC' },
      })
      .then((finders) => finders.map((finder) => finder.userId));
  }

  async getFinderActivityState(props: { userId?: number }) {
    const { userId } = props;
    return this.finderRepository
      .find({
        where: { userId },
        order: { id: 'DESC' },
        take: 1,
      })
      .then((finders) => finders[0]?.isEnabled);
  }

  async enableFinder(userId: number) {
    await this.finderRepository.update({ userId }, { isEnabled: true });
  }

  async disableFinder(userId: number) {
    await this.finderRepository.update({ userId }, { isEnabled: false });
  }

  async addFinder(userId: number) {
    const finder = this.finderRepository.create({
      userId,
      isEnabled: false,
    });

    await this.finderRepository.insert(finder);

    return {
      id: finder.id,
      isEnabled: finder.isEnabled,
    };
  }

  async removeFinder(userId: number) {
    await this.finderRepository.delete({ userId });
  }

  @OnEvent('user.created')
  async handleUserCreated(event: UserCreatedEvent) {
    await this.addFinder(event.userId);
  }

  @OnEvent('user.deleted')
  async handleUserDeleted(event: UserDeletedEvent) {
    await this.removeFinder(event.userId);
  }
}
