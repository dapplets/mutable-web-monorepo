import { OpenAIEmbeddings } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ContextNode } from './entities/context.entity';
import type { Document } from '@langchain/core/documents';
import { OPENAI_API_KEY, OPENAI_BASE_URL, CRAWLER_DATABASE_URL } from '../env';
import {
  PGVectorStore,
  DistanceStrategy,
} from '@langchain/community/vectorstores/pgvector';
import { PoolConfig } from 'pg';

@Injectable()
export class IndexerService {
  private vectorStorePromise: Promise<PGVectorStore>;

  constructor() {
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
    const document: Document = {
      pageContent: JSON.stringify(context.content),
      metadata: {
        namespace: context.metadata.namespace,
        contextType: context.metadata.contextType,
        id: context.metadata.id,
        hash: context.metadata.hash,
      },
    };

    const vectorStore = await this.vectorStorePromise;

    try {
      await vectorStore.addDocuments([document], {
        ids: [context.id],
      });
    } catch (_) {}
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
