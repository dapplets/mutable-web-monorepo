import { Injectable } from '@nestjs/common';
import { CapabilityRepository } from './capability.repository';
import { UserCapabilityRepository } from './user-capability.repository';
import { UserService } from '../user/user.service';
import { CodedRpcException } from '@dapplets/openrpc-nestjs-json-rpc';
import { NearAiService } from '../nearai/nearai.service';

@Injectable()
export class CapabilitiesService {
  constructor(
    private readonly capabilityRepository: CapabilityRepository,
    private readonly userCapabilityRepository: UserCapabilityRepository,
    private readonly userService: UserService,
    private readonly nearAiService: NearAiService,
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

  async syncCapabilities(username: string) {
    const user = await this.userService.getUserByUsername(username);

    if (!user.nearAccountId) {
      throw new CodedRpcException('User is not logged in');
    }

    const agents = await this.nearAiService.getAgentsForUser(
      user.nearAccountId,
    );

    for (const agent of agents) {
      let existingAgent = await this.capabilityRepository.findOneBy({
        domain: agent.domain,
        name: agent.name,
      });

      if (!existingAgent) {
        existingAgent = await this.capabilityRepository.save({
          domain: agent.domain,
          name: agent.name,
          title: agent.title,
          description: agent.description,
          stars: agent.stars,
        });
      }

      await this.userCapabilityRepository.upsert(
        {
          capabilityId: existingAgent.id,
          username,
        },
        { conflictPaths: ['capabilityId', 'username'] },
      );
    }
  }
}
