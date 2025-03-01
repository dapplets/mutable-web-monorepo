import { Injectable } from '@nestjs/common';
import { ContextNode } from 'src/context/entities/context-node.entity';
import { utils } from '@mweb/backend';

export type Agent = {
  id: string;
  metadata: {
    name: string;
    description?: string;
    image?: {
      ipfs_cid?: string;
    };
  };
  type: 'openfaas' | 'nearai';
  image: string;
  targets: any[];
};

const SentimentAnalysis: Agent = {
  id: 'dapplets.near/agent/sentiment-analysis',
  metadata: {
    name: 'Sentiment Analysis',
    description: 'Simple Agent for Crawler',
    image: {
      ipfs_cid: 'bafkreifw5rwd7r2k7sk6xo45wc7g2y3pe5wewqztlnipo2wnjatz6fsp34',
    },
  },
  type: 'openfaas',
  image: 'ghcr.io/dapplets/sentiment-analysis-agent:latest',
  targets: [
    {
      namespace: 'bos.dapplets.near/parser/twitter',
      contextType: 'post',
      if: { id: { not: null } },
    },
    {
      namespace: 'bos.dapplets.testnet/parser/twitter',
      contextType: 'post',
      if: { id: { not: null } },
    },
    {
      namespace: 'bos.dapplets.near/parser/github',
      contextType: 'post',
      if: { id: { not: null } },
    },
    {
      namespace: 'bos.dapplets.testnet/parser/github',
      contextType: 'post',
      if: { id: { not: null } },
    },
  ],
};

const FakeDetector: Agent = {
  id: 'dapplets.near/agent/fake-detector',
  metadata: {
    name: 'Fake Detector',
    image: {
      ipfs_cid: 'bafkreifw5rwd7r2k7sk6xo45wc7g2y3pe5wewqztlnipo2wnjatz6fsp34',
    },
  },
  type: 'openfaas',
  image: 'ghcr.io/dapplets/fake-detector-agent:latest',
  targets: [
    {
      namespace: 'bos.dapplets.near/parser/twitter',
      contextType: 'post',
      if: { id: { not: null } },
    },
    {
      namespace: 'bos.dapplets.testnet/parser/twitter',
      contextType: 'post',
      if: { id: { not: null } },
    },
    {
      namespace: 'bos.dapplets.near/parser/github',
      contextType: 'post',
      if: { id: { not: null } },
    },
    {
      namespace: 'bos.dapplets.testnet/parser/github',
      contextType: 'post',
      if: { id: { not: null } },
    },
  ],
};

const NearAiFakeDetectorAgent: Agent = {
  id: 'dapplets.near/agent/nearai-fake-detector',
  metadata: {
    name: 'NEAR AI Fake Detector',
    image: {
      ipfs_cid: 'bafkreifw5rwd7r2k7sk6xo45wc7g2y3pe5wewqztlnipo2wnjatz6fsp34',
    },
  },
  type: 'nearai',
  image: 'dapplets.near/nearai-fake-detector/latest',
  targets: [
    {
      namespace: 'bos.dapplets.near/parser/twitter',
      contextType: 'post',
      if: { id: { not: null } },
    },
    {
      namespace: 'bos.dapplets.testnet/parser/twitter',
      contextType: 'post',
      if: { id: { not: null } },
    },
    {
      namespace: 'bos.dapplets.near/parser/github',
      contextType: 'post',
      if: { id: { not: null } },
    },
    {
      namespace: 'bos.dapplets.testnet/parser/github',
      contextType: 'post',
      if: { id: { not: null } },
    },
  ],
};

const CrawlerAgent: Agent = {
  id: 'dapplets.near/agent/crawler',
  metadata: {
    name: 'AI Crawler Agent',
    image: {
      ipfs_cid: 'bafkreifw5rwd7r2k7sk6xo45wc7g2y3pe5wewqztlnipo2wnjatz6fsp34',
    },
  },
  type: 'openfaas',
  image: 'ghcr.io/dapplets/crawler-agent:latest',
  targets: [
    {
      namespace: 'engine',
      contextType: 'website',
      if: { url: { not: null } },
    },
  ],
};

const AssociativeSummarizer: Agent = {
  id: 'dapplets.near/agent/associative-summarizer',
  metadata: {
    name: 'Associative Summarizer',
    image: {
      ipfs_cid: 'bafkreifw5rwd7r2k7sk6xo45wc7g2y3pe5wewqztlnipo2wnjatz6fsp34',
    },
  },
  type: 'openfaas',
  image: 'ghcr.io/dapplets/associative-summarizer-agent:latest',
  targets: [
    {
      namespace: 'bos.dapplets.near/parser/twitter',
      contextType: 'post',
      if: { id: { not: null } },
    },
    {
      namespace: 'bos.dapplets.testnet/parser/twitter',
      contextType: 'post',
      if: { id: { not: null } },
    },
    {
      namespace: 'bos.dapplets.near/parser/github',
      contextType: 'post',
      if: { id: { not: null } },
    },
    {
      namespace: 'bos.dapplets.testnet/parser/github',
      contextType: 'post',
      if: { id: { not: null } },
    },
  ],
};

const AllAgents = [
  SentimentAnalysis,
  FakeDetector,
  NearAiFakeDetectorAgent,
  CrawlerAgent,
  AssociativeSummarizer,
];

@Injectable()
export class AgentService {
  async getAgents() {
    return AllAgents;
  }

  async getAgentById(id: string) {
    return AllAgents.find((agent) => agent.id === id);
  }

  async getAgentsForContext(context: ContextNode) {
    const contextNodeAsInCore = {
      contextType: context.metadata.contextType,
      namespace: context.metadata.namespace,
      id: context.metadata.id,
      parsedContext: context.content,
    };

    return AllAgents.filter((agent) =>
      agent.targets.some(
        (target) => utils.isTargetMet(target, contextNodeAsInCore as any), // ToDo: workaround
      ),
    );
  }
}
