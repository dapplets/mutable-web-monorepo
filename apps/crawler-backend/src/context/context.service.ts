import { Injectable } from '@nestjs/common';
import { StoreContextDto } from './dtos/store-context.dto';

@Injectable()
export class ContextService {
  nodes = new Map<string, any>();
  edges = new Map<string, string>();

  constructor() {
    this.nodes.set('root', {
      id: 'root',
      namespace: 'root',
      contextType: 'root',
      parsedContext: {
        id: 'root',
      },
    });
  }

  async storeContext(node: StoreContextDto): Promise<void> {
    this.storeNode(node);
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

  private storeNode(node: StoreContextDto): number {
    const globalId = `${node.namespace}/${node.contextType}/${node.id}`;

    // ToDo: skip existing nodes
    const clonedNode = {
      namespace: node.namespace,
      contextType: node.contextType,
      id: node.id,
      parsedContext: node.parsedContext,
    };
    this.nodes.set(globalId, clonedNode);

    let i = 1;

    if (node.parentNode) {
      const parentGlobalId = `${node.parentNode.namespace}/${node.parentNode.contextType}/${node.parentNode.id}`;
      this.edges.set(parentGlobalId, globalId);
      this.edges.set(globalId, parentGlobalId);
      i += this.storeNode(node.parentNode);
    } else {
      this.edges.set(globalId, 'root');
      this.edges.set('root', globalId);
    }

    return i;
  }
}
