import { Injectable } from '@nestjs/common';
import { CapabilityRepository } from './capability.repository';
import { UserCapabilityRepository } from './user-capability.repository';
import { UserService } from '../user/user.service';
import { CodedRpcException } from '@dapplets/openrpc-nestjs-json-rpc';
import { NearAiService } from '../nearai/nearai.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from 'src/user/user-created.event';
import { NearService } from 'src/near/near.service';
import { ConfigService } from '@nestjs/config';
import { NftMintedEvent } from './nft-minted.event';
import { UserDeletedEvent } from 'src/user/user-deleted.event';

@Injectable()
export class CapabilityService {
  constructor(
    private readonly capabilityRepository: CapabilityRepository,
    private readonly userCapabilityRepository: UserCapabilityRepository,
    private readonly userService: UserService,
    private readonly nearAiService: NearAiService,
    private readonly nearService: NearService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getCapabilitiesForUser(userId: number, limit: number, offset: number) {
    const [items, total] =
      await this.userCapabilityRepository.getCapabilitiesForUser(
        userId,
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

  async removeCapability(userId: number, capabilityId: string) {
    await this.userCapabilityRepository.update(
      { userId, capabilityId },
      { isDeleted: true },
    );
  }

  async enableCapability(userId: number, capabilityId: string) {
    await this.userCapabilityRepository.update(
      { userId, capabilityId },
      { isEnabled: true },
    );
  }

  async disableCapability(userId: number, capabilityId: string) {
    await this.userCapabilityRepository.update(
      { userId, capabilityId },
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

  async syncCapabilities(userId: number) {
    const user = await this.userService.getUserById(userId);

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
          userId,
        },
        { conflictPaths: ['capabilityId', 'userId'] },
      );
    }
  }

  async getOrMintCapabilityWithNft(capabilityId: string, callerUserId: number) {
    let capability = await this.capabilityRepository.findOneBy({
      id: capabilityId,
    });

    // mint NFT if not minted
    if (!capability?.tokenId) {
      capability = await this.mintNftForCapability(capabilityId, callerUserId);
    }

    return {
      ...capability.toDto(),
      tokenId: capability.tokenId,
      beneficiaryNetwork: capability.beneficiaryNetwork,
      beneficiaryAccountId: capability.beneficiaryAccountId,
    };
  }

  async mintNftForCapability(capabilityId: string, callerUserId: number) {
    const capability = await this.capabilityRepository.findOneBy({
      id: capabilityId,
    });

    if (!capability) {
      throw new CodedRpcException('Capability not found');
    }

    if (capability.tokenId) {
      throw new CodedRpcException('NFT already minted');
    }

    const contractOwnerPrivateKey = this.configService.get<string>(
      'NFT_CONTRACT_OWNER_PRIVATE_KEY',
    )!;
    const contractOwnerId = this.configService.get<string>(
      'NFT_CONTRACT_OWNER_ID',
    )!;
    const nftContractId = this.configService.get<string>('NFT_CONTRACT_ID')!;

    const newTokenId = (await this.nearService.viewContractCall(
      nftContractId,
      'nft_total_supply',
      {},
    )) as string;

    await this.nearService.writeContractCall(
      contractOwnerPrivateKey,
      contractOwnerId,
      nftContractId,
      'nft_mint',
      {
        token_id: newTokenId,
        token_owner_id: capability.name.split('/')[0],
        token_metadata: {
          copies: 1,
          description: capability.description,
          title: `${capability.name.split('/')[1]} by ${capability.name.split('/')[0]}`,
          extra: JSON.stringify({
            beneficiary_network: 'near',
            beneficiary_account_id: capability.name.split('/')[0],
            agent_domain: 'Near AI',
            agent_id: capability.name,
          }),
        },
      },
      8560000000000000000000n,
    );

    capability.tokenId = newTokenId;
    capability.beneficiaryNetwork = 'near'; // ToDo: hardcoded
    capability.beneficiaryAccountId = capability.name.split('/')[0];

    await this.capabilityRepository.save(capability);

    this.eventEmitter.emit(
      'capability.minted',
      new NftMintedEvent(nftContractId, newTokenId, callerUserId),
    );

    return capability;
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
        userId: event.userId,
      },
      { conflictPaths: ['capabilityId', 'userId'] },
    );

    // top 10 near ai capabilities
    await this.userCapabilityRepository.addTop10CapabilitiesToUser(
      event.userId,
    );
  }

  @OnEvent('user.deleted')
  async handleUserDeleted(event: UserDeletedEvent) {
    await this.userCapabilityRepository.delete(event.userId);
  }
}
