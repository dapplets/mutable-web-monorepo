import { Injectable } from '@nestjs/common';
import { CapabilityRepository } from './capability.repository';
import { UserCapabilityRepository } from './user-capability.repository';
import { UserService } from '../user/user.service';
import { CodedRpcException } from '@dapplets/openrpc-nestjs-json-rpc';
import { NearAiService } from '../nearai/nearai.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from 'src/user/user-created.event';

@Injectable()
export class CapabilityService {
  constructor(
    private readonly capabilityRepository: CapabilityRepository,
    private readonly userCapabilityRepository: UserCapabilityRepository,
    private readonly userService: UserService,
    private readonly nearAiService: NearAiService,
    private readonly eventEmitter: EventEmitter2,
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
        ...item.capability.toDto(),
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

  async createCapability(createCapabilityDto: {
    domain: string;
    name: string;
    title: string;
    description: string;
  }) {
    const capability = this.capabilityRepository.create(createCapabilityDto);
    await this.capabilityRepository.insert(capability);
    return capability.toDto();
  }

  async syncCapabilities(username: string) {
    const user = await this.userService.getUserByUsername(username);

    if (!user) {
      throw new CodedRpcException('User not found');
    }

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

  @OnEvent('user.created')
  async handleUserCreated(event: UserCreatedEvent) {
    let capability = await this.capabilityRepository.findOneBy({
      domain: 'core',
      name: 'news-monitor',
    });

    // ToDo: dehardcode
    if (!capability) {
      capability = this.capabilityRepository.create({
        domain: 'core',
        name: 'news-monitor',
        title: 'News Monitor',
        description: 'Monitor news',
      });
      await this.capabilityRepository.insert(capability);
    }

    // add news monitor capability to user
    await this.userCapabilityRepository.upsert(
      {
        capabilityId: capability.id,
        username: event.username,
      },
      { conflictPaths: ['capabilityId', 'username'] },
    );

    // top 10 near ai capabilities
    await this.userCapabilityRepository.addTop10CapabilitiesToUser(
      event.username,
    );
  }
}
