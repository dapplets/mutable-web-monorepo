import { Injectable } from '@nestjs/common';
import { ContextNodeRepository } from './context-node.repository';
import { ContextEdgeRepository } from './context-edge.repository';

export type TransferableContext = {
  namespace: string;
  type: string;
  id: string;
  content: unknown;
  parent: TransferableContext | null;
};

export type TransferableContextEdge = {
  fromContextNamespace: string;
  fromContextType: string;
  fromContextId: string;
  toContextNamespace: string;
  toContextType: string;
  toContextId: string;
};

@Injectable()
export class ContextService {
  constructor(
    private readonly contextNodeRepository: ContextNodeRepository,
    private readonly contextEdgeRepository: ContextEdgeRepository,
  ) {}

  async getContexts(source: string, link: string, timestamp: string) {
    return this.contextNodeRepository.getContextsByProfile(
      source,
      link,
      timestamp,
    );
  }

  async getLastSavedTelegramMessageId(link: string) {
    return this.contextNodeRepository.getLastSavedTelegramMessageId(link);
  }

  async addContext(context: TransferableContext): Promise<void> {
    // console.log(context);
    // todo: check cache
    // todo: call n8n
    // todo: save response from n8n to db (cache)

    if (context.parent) {
      await this.addContext(context.parent);
    }

    await this.contextNodeRepository.save({
      id: context.id,
      namespace: context.namespace,
      type: context.type,
      content: context.content,
    });
  }

  async addContextEdge(contextEdge: TransferableContextEdge): Promise<void> {
    // console.log(contextEdge);
    // todo: check cache
    // todo: call n8n
    // todo: save response from n8n to db (cache)

    await this.contextEdgeRepository.save({
      fromContextNamespace: contextEdge.fromContextNamespace,
      fromContextType: contextEdge.fromContextType,
      fromContextId: contextEdge.fromContextId,
      toContextNamespace: contextEdge.toContextNamespace,
      toContextType: contextEdge.toContextType,
      toContextId: contextEdge.toContextId,
    });
  }
}
