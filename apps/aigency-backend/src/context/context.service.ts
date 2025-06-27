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

@Injectable()
export class ContextService {
  constructor(
    private readonly contextNodeRepository: ContextNodeRepository,
    private readonly contextEdgeRepository: ContextEdgeRepository,
  ) {}

  async addContext(context: TransferableContext): Promise<void> {
    console.log(context);
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
}
