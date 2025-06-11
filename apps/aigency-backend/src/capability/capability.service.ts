import { Injectable } from '@nestjs/common';
import { CapabilityRepository } from './capability.repository';
import { PaginationDto } from 'src/common/pagination.dto';
import { UserCapabilityRepository } from './user-capability.repository';

@Injectable()
export class CapabilitiesService {
  constructor(
    private readonly capabilityRepository: CapabilityRepository,
    private readonly userCapabilityRepository: UserCapabilityRepository,
  ) {}

  async getCapabilitiesForUser(
    username: string,
    limit: number,
    offset: number,
  ) {
    const [items, total] =
      await this.userCapabilityRepository.getCapabilitiesForUser(
        username,
        limit,
        offset,
      );

    return {
      total,
      items: items.map((item) => ({
        id: item.capability.id,
        domain: item.capability.domain,
        name: item.capability.name,
        title: item.capability.title,
        description: item.capability.description,
        isEnabled: item.isEnabled,
      })),
    };
  }

  async removeCapability(username: string, capabilityId: string) {
    await this.userCapabilityRepository.update(
      { username, capabilityId },
      { isDeleted: true },
    );
  }

  async enableCapability(username: string, capabilityId: string) {
    await this.userCapabilityRepository.update(
      { username, capabilityId },
      { isEnabled: true },
    );
  }

  async disableCapability(username: string, capabilityId: string) {
    await this.userCapabilityRepository.update(
      { username, capabilityId },
      { isEnabled: false },
    );
  }
}
