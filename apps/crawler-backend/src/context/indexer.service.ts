import { OpenAIEmbeddings } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ContextNode } from './entities/context-node.entity';
import type { Document } from '@langchain/core/documents';
import { OPENAI_API_KEY, OPENAI_BASE_URL, CRAWLER_DATABASE_URL } from '../env';
import {
  PGVectorStore,
  DistanceStrategy,
} from '@langchain/community/vectorstores/pgvector';
import { PoolConfig } from 'pg';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class IndexerService {
  private logger = new Logger(IndexerService.name);
  private vectorStorePromise: Promise<PGVectorStore>;

  constructor(
    @InjectRepository(ContextNode)
    private contextNodeRepository: Repository<ContextNode>,
  ) {
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
      configuration: {
        baseURL: OPENAI_BASE_URL,
        apiKey: OPENAI_API_KEY,
      },
    });

    // Sample config
    const config = {
      postgresConnectionOptions: {
        type: 'postgres',
        connectionString: CRAWLER_DATABASE_URL,
      } as PoolConfig,
      tableName: 'context_node',
      columns: {
        idColumnName: 'id',
        vectorColumnName: 'vector',
        contentColumnName: 'content',
        metadataColumnName: 'metadata',
      },
      // supported distance strategies: cosine (default), innerProduct, or euclidean
      distanceStrategy: 'cosine' as DistanceStrategy,
    };

    this.vectorStorePromise = PGVectorStore.initialize(embeddings, config);
  }

  async addContext(context: ContextNode) {
    // ToDo: wait for initialization of context_node table
    const vectorStore = await this.vectorStorePromise;

    this.logger.debug('Vector store ready');

    const isExist = await this.contextNodeRepository.exists({
      where: { id: context.id },
    });

    if (isExist) {
      this.logger.debug(`Context node exists: ${context.id}`);
      return;
    } else {
      this.logger.debug(`Context node doesn't exist, saving: ${context.id}`);
    }

    const document: Document = {
      pageContent: JSON.stringify(context.content),
      metadata: {
        namespace: context.metadata.namespace,
        contextType: context.metadata.contextType,
        id: context.metadata.id,
        hash: context.metadata.hash,
      },
    };

    try {
      const startTime = performance.now();

      // ToDo: queue
      await vectorStore.addDocuments([document], {
        ids: [context.id],
      });

      this.logger.debug(`Document added to vector store: ${context.id}`);

      const duration = performance.now() - startTime;

      this.logger.log(
        `Context indexed ${context.metadata.namespace}:${context.metadata.contextType}:${context.metadata.id} for ${duration} ms`,
      );
    } catch (err) {
      this.logger.error(
        `Document saving to vector store failed: ${context.id}`,
        err,
      );
    }
  }

  async getSimilarContexts(query: string, limit: number) {
    const vectorStore = await this.vectorStorePromise;

    const searchResults = await vectorStore.similaritySearchWithScore(
      query,
      limit,
    );

    return searchResults;
  }
}
