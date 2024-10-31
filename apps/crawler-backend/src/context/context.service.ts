import { Injectable } from '@nestjs/common';
import { ContextDto, StoreContextDto } from './dtos/store-context.dto';
import { CRAWLER_PRIVATE_KEY } from '../env';
import stringify from 'json-stringify-deterministic';
import { sha256 } from '@noble/hashes/sha256';
import { utils } from 'near-api-js';
import { BorshSchema, borshSerialize } from 'borsher';

const toHexString = (arr: Uint8Array) =>
  Array.from(arr, (i) => i.toString(16).padStart(2, '0')).join('');

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

  async storeContext(
    dto: StoreContextDto,
  ): Promise<{ receipt: any; signature: string; public_key: string }[]> {
    const schema = BorshSchema.Struct({
      data_hash: BorshSchema.Vec(BorshSchema.u8),
      amount: BorshSchema.u128,
      receiver_id: BorshSchema.String,
    });

    const hashes = this.storeNode(dto.context, this._rootHash);

    const receipts = hashes
      .map((hash) => ({
        hash,
        amount: '0.0001',
        receiver_id: dto.receiverId,
      }))
      .map((receipt) => {
        const { signature, publicKey } = this._keyPair.sign(
          borshSerialize(schema, receipt),
        );
        return {
          receipt,
          signature: toHexString(signature),
          public_key: toHexString(publicKey.data),
        };
      });

    return receipts;
  }

  async getContexts(): Promise<{
    nodes: { id: string; data: StoreContextDto }[];
    edges: { source: string; target: string }[];
  }> {
    return {
      nodes: Array.from(this.nodes.entries()).map(([id, data]) => ({
        id,
        label: data.id,
        data,
      })),
      edges: Array.from(this.edges.entries()).map(([source, target]) => ({
        id: `${source}-${target}`,
        source,
        target,
      })),
    };
  }

  private storeNode(node: ContextDto, parentHash: string): string[] {
    // ToDo: skip existing nodes
    const { node: clonedNode, hash } = this._prepareNode({
      namespace: node.namespace,
      contextType: node.contextType,
      id: node.id,
      parsedContext: node.parsedContext,
    });

    this.nodes.set(hash, clonedNode);

    const hashes: string[] = [hash];

    this.edges.set(parentHash, hash);
    this.edges.set(hash, parentHash);

    hashes.push(...this.storeNode(node.parentNode, hash));

    return hashes;
  }

  private _prepareNode(inputNode: any): { node: any; hash: string } {
    const node = {
      namespace: inputNode.namespace,
      contextType: inputNode.contextType,
      id: inputNode.id,
      parsedContext: inputNode.parsedContext,
    };
    const json = stringify(node);
    const hash = toHexString(new Uint8Array(sha256(json)));
    return { node, hash };
  }
}
