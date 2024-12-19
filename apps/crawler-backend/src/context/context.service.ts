import { Injectable } from '@nestjs/common';
import { ContextDto, StoreContextDto } from './dtos/store-context.dto';
import { CRAWLER_PRIVATE_KEY } from '../env';
import stringify from 'json-stringify-deterministic';
import { sha256 } from '@noble/hashes/sha256';
import {
  utils,
  Contract,
  Connection,
  InMemorySigner,
  providers,
  keyStores,
} from 'near-api-js';
import { BorshSchema, borshSerialize } from 'borsher';

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
  nodes = new Map<string, any>();
  edges = new Map<string, string>();

  private _rootHash: string;
  private _keyPair = new utils.KeyPairEd25519(CRAWLER_PRIVATE_KEY);

  constructor() {
    const { node, hash } = this._prepareNode({
      id: 'root',
      namespace: 'root',
      contextType: 'root',
      parsedContext: {
        id: 'root',
      },
    });

    this.nodes.set(hash, node);

    this._rootHash = hash;
  }

  async storeContext(dto: StoreContextDto): Promise<
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

    this.storeNode(dto.context, (hash) => storedHashes.push(hash));

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
    edges: { source: string; target: string }[];
  }> {
    return {
      nodes: Array.from(this.nodes.entries()).map(([id]) => ({
        id,
        label: id.substring(0, 10),
      })),
      edges: Array.from(this.edges.entries()).map(([source, target]) => ({
        id: `${source}-${target}`,
        source,
        target,
      })),
    };
  }

  async getContext(
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

    return {
      context: isPaid ? this.nodes.get(hash) : null,
      status: isPaid ? 'paid' : 'unpaid',
    };
  }

  // ToDo: refactor onStore
  private storeNode(node: ContextDto, onStore: (hash: string) => void): string {
    const { node: clonedNode, hash } = this._prepareNode({
      namespace: node.namespace,
      contextType: node.contextType,
      id: node.id,
      parsedContext: node.parsedContext,
    });

    // skip existing nodes => only the first parser will be rewarded
    if (this.nodes.has(hash)) {
      return hash;
    }

    this.nodes.set(hash, clonedNode);
    onStore(hash);

    const parentHash = node.parentNode
      ? this.storeNode(node.parentNode, onStore)
      : this._rootHash;

    // this.edges.set(parentHash, hash);
    this.edges.set(hash, parentHash);

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
}
