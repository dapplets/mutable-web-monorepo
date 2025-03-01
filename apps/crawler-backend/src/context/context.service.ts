import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ContextDto,
  InvokeAgentDto,
  StoreContextDto,
} from './dtos/store-context.dto';
import { CRAWLER_PRIVATE_KEY } from '../env';
import stringify from 'json-stringify-deterministic';
import {
  utils,
  Contract,
  Connection,
  InMemorySigner,
  providers,
  keyStores,
} from 'near-api-js';
import { BorshSchema, borshSerialize } from 'borsher';
import { ContextNode } from './entities/context-node.entity';
import { ContextEdge } from './entities/context-edge.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SchedulerService } from 'src/scheduler/scheduler.service';
import { IndexerService } from './indexer.service';
import crypto from 'crypto';
import { sha256 } from '@noble/hashes/sha256';

function base64ToBytes(base64: string): Uint8Array {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

function bytesToBase64(bytes: Uint8Array): string {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join('');
  return btoa(binString);
}

@Injectable()
export class ContextService {
  private logger = new Logger(ContextService.name);

  private _rootContext: ContextNode;
  private _keyPair = new utils.KeyPairEd25519(CRAWLER_PRIVATE_KEY);

  constructor(
    @InjectRepository(ContextNode)
    private contextNodeRepository: Repository<ContextNode>,
    @InjectRepository(ContextEdge)
    private contextEdgeRepository: Repository<ContextEdge>,
    @Inject(SchedulerService)
    private schedulerService: SchedulerService,
    @Inject(IndexerService)
    private indexerService: IndexerService,
  ) {
    const rootContext = {
      id: 'root',
      namespace: 'root',
      contextType: 'root',
      parsedContext: {
        id: 'root',
      },
    };

    const { hash } = this._prepareNode(rootContext);

    this._rootContext = {
      id: ContextService._generateUUIDFromString(hash),
      metadata: {
        namespace: rootContext.namespace,
        contextType: rootContext.contextType,
        id: rootContext.id,
        hash: hash,
      },
      content: rootContext.parsedContext,
    };

    // ToDo: await
    this.indexerService.addContext(this._rootContext);
  }

  async invokeAgent(dto: InvokeAgentDto): Promise<{ context: any }> {
    this.logger.debug(`Agent invoked: ${dto.context.contextType}`);
    const { hash: inputContextHash } = this._prepareNode(dto.context);

    // check cache
    const edges = await this.contextEdgeRepository.find({
      where: {
        namespace: dto.agentId,
        type: 'reply',
        source: inputContextHash,
      },
      take: 1,
    });

    if (edges.length > 0) {
      this.logger.debug(`Cache exists: ${dto.context.contextType}`);
    } else {
      this.logger.debug(`No cache, executing: ${dto.context.contextType}`);
    }

    // return cached response
    if (edges.length > 0) {
      const edge = edges[0];

      // ToDo: uuid and hash should be the same
      const uuid = ContextService._generateUUIDFromString(edge.target);
      const node = await this.getContextNodeById(uuid);

      if (node) {
        return {
          context: {
            namespace: node.metadata.namespace,
            contextType: node.metadata.contextType,
            id: node.metadata.id,
            parsedContext: node.content,
          },
        };
      }
    }

    // store context and invoke agent
    if (dto.receiverId) {
      await this.storeContextForRewards({
        context: dto.context,
        receiverId: dto.receiverId,
      });
    } else {
      await this.saveContextTree(dto.context);
      this.logger.debug(`Context tree saved: ${dto.context.contextType}`);
    }

    return { context: null };
  }

  async storeContextForRewards(dto: StoreContextDto): Promise<
    {
      receipt: {
        data_hash: string;
        amount: string;
        receiver_id: string;
      };
      signature: string;
      public_key: string;
    }[]
  > {
    // ToDo
    if (dto.context.parentNode?.contextType === 'post') {
      return [];
    }

    const storedHashes: string[] = [];

    await this.saveContextTree(dto.context, (hash) => storedHashes.push(hash));

    const schema = BorshSchema.Struct({
      data_hash: BorshSchema.Vec(BorshSchema.u8),
      amount: BorshSchema.u128,
      receiver_id: BorshSchema.String,
    });

    const receipts = storedHashes.map((hash) => {
      const receipt = {
        data_hash: hash,
        amount: '1000000000000000000000',
        receiver_id: dto.receiverId,
      };

      const { signature, publicKey } = this._keyPair.sign(
        borshSerialize(schema, {
          data_hash: base64ToBytes(receipt.data_hash),
          amount: receipt.amount,
          receiver_id: receipt.receiver_id,
        }),
      );

      return {
        receipt,
        signature: bytesToBase64(signature),
        public_key: bytesToBase64(publicKey.data),
      };
    });

    return receipts;
  }

  async getContexts(): Promise<{
    nodes: { id: string; label: string }[];
    edges: { id: string; source: string; target: string }[];
  }> {
    // ToDo: parallel

    const nodes = await this.contextNodeRepository.find({
      select: { metadata: { hash: true, contextType: true, id: true } },
    });

    const edges = await this.contextEdgeRepository.find({
      select: { source: true, target: true, type: true },
    });

    return {
      nodes: nodes.map(({ metadata }) => ({
        id: metadata.hash,
        label: metadata.id,
        subLabel: metadata.contextType,
      })),
      edges: edges.map(({ source, target, type }) => ({
        id: `${source}-${target}`,
        source: source,
        target: target,
        label: type,
      })),
    };
  }

  async getContextNodeById(uuid: string): Promise<ContextNode | null> {
    const context = await this.contextNodeRepository.findOne({
      where: { id: uuid },
    });

    // ToDo
    if (!context) {
      return null;
    }

    return context;
  }

  async getPaidContext(
    hash: string,
  ): Promise<{ context: ContextDto | null; status: 'paid' | 'unpaid' }> {
    const keyStore = new keyStores.InMemoryKeyStore();
    const signer = new InMemorySigner(keyStore);
    const provider = new providers.JsonRpcProvider({
      url: 'https://rpc.mainnet.near.org',
    });
    const connection = new Connection('mainnet', provider, signer, '');
    const contract = new Contract(connection, 'app.crwl.near', {
      useLocalViewExecution: false,
      viewMethods: ['is_paid_data'],
      changeMethods: [],
    });

    // @ts-expect-error methods are not typed
    const isPaid = await contract.is_paid_data({ data_hash: hash });

    // ToDo: uuid and hash should be the same
    const uuid = ContextService._generateUUIDFromString(hash);

    const context = await this.contextNodeRepository.findOne({
      where: { id: uuid },
    });

    // ToDo
    if (!context) {
      return {
        context: null,
        status: 'unpaid',
      };
    }

    const dto = {
      hash: context.metadata.hash,
      namespace: context.metadata.namespace,
      contextType: context.metadata.contextType,
      id: context.metadata.id,
      parsedContext: context.content,
    };

    return {
      context: isPaid ? dto : null,
      status: isPaid ? 'paid' : 'unpaid',
    };
  }

  async getSimilarContexts(query: string, limit: number) {
    return this.indexerService.getSimilarContexts(query, limit);
  }

  async saveContextNode(node: ContextDto) {
    const { node: clonedNode, hash } = this._prepareNode({
      namespace: node.namespace,
      contextType: node.contextType,
      id: node.id,
      parsedContext: node.parsedContext,
    });

    // skip existing nodes => only the first parser will be rewarded

    const uuid = ContextService._generateUUIDFromString(hash);

    // ToDo: remove
    const existingContext = await this.contextNodeRepository.findOne({
      where: { id: uuid },
    });

    if (existingContext) {
      this.logger.debug(`Context node exists: ${uuid}`);
    } else {
      this.logger.debug(`Context node doesn't exist, saving: ${uuid}`);
    }

    if (!existingContext) {
      const contextToStore = {
        id: uuid,
        metadata: {
          namespace: clonedNode.namespace,
          contextType: clonedNode.contextType,
          id: clonedNode.id,
          hash: hash,
        },
        content: clonedNode.parsedContext,
      };

      await this.indexerService.addContext(contextToStore);

      this.logger.debug(`Context node saved: ${uuid}`);

      // ToDo: don't wait
      await this.schedulerService.processContext(contextToStore);

      this.logger.debug(`Context node added to agents queue: ${uuid}`);

      return contextToStore;
    }

    return existingContext;
  }

  async saveEdge(data: {
    source: string;
    target: string;
    namespace: string;
    type: string;
  }) {
    await this.contextEdgeRepository.save(data);
  }

  // ToDo: refactor onStore
  private async saveContextTree(
    node: ContextDto,
    onStore?: (hash: string) => void,
  ): Promise<string> {
    const savedContext = await this.saveContextNode(node);

    this.logger.debug(`Current context saved`);

    const hash = savedContext.metadata.hash;

    onStore?.(hash);

    const parentHash = node.parentNode
      ? await this.saveContextTree(node.parentNode, onStore)
      : this._rootContext.metadata.hash;

    this.logger.debug(`Parent context saved`);

    await this.saveEdge({
      source: parentHash,
      target: hash,
      namespace: node.namespace,
      type: 'child', // ToDo: parser config should provide relationship types
    });

    this.logger.debug(`Edge saved`);

    return hash;
  }

  private _prepareNode(inputNode: any): { node: any; hash: string } {
    const node = {
      namespace: inputNode.namespace,
      contextType: inputNode.contextType,
      id: inputNode.id,
      parsedContext: inputNode.parsedContext,
    };
    const json = stringify(node);
    const hash = bytesToBase64(new Uint8Array(sha256(json)));
    return { node, hash };
  }

  private static _generateUUIDFromString(input) {
    // Hash the input string using SHA-256
    const hash = crypto.createHash('sha256').update(input).digest('hex');

    // Use the first 128 bits (32 hex characters) of the hash to construct a UUID
    const uuid = [
      hash.substr(0, 8),
      hash.substr(8, 4),
      '4' + hash.substr(12, 3), // UUID version 4
      ((parseInt(hash.substr(16, 1), 16) & 0x3) | 0x8).toString(16) +
        hash.substr(17, 3), // Variant
      hash.substr(20, 12),
    ].join('-');

    return uuid;
  }
}
