import { Injectable } from '@nestjs/common';
import { FinderRepository } from './finder.repository';

@Injectable()
export class FinderService {
  constructor(private readonly finderRepository: FinderRepository) {}

  async getActiveFinders() {
    return this.finderRepository.find({
      where: { isEnabled: true },
      order: { id: 'DESC' },
    });
  }

  async getFinderActivityState(props: { userId?: number }) {
    const { userId } = props;
    return this.finderRepository.find({
      where: { userId },
      order: { id: 'DESC' },
      take: 1,
    });
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
}
