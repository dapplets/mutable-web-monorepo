import { Injectable } from '@nestjs/common';
import { ContextNode } from 'src/context/entities/context-node.entity';
import { utils } from '@mweb/backend';

export type Agent = {
  id: string;
  metadata: {
    name: string;
    description?: string;
  };
  type: 'openfaas' | 'nearai';
  image: string;
  targets: any[];
};

const SentimentAnalysis: Agent = {
  id: 'dapplets.near/agent/sentiment-analysis',
  metadata: {
    name: 'Simple Agent',
    description: 'Simple Agent for Crawler',
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
  ],
};

const FakeDetector: Agent = {
  id: 'dapplets.near/agent/fake-detector',
  metadata: {
    name: 'Fake Detector',
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
  ],
};

const NearAiExampleAgent: Agent = {
  id: 'dapplets.near/agent/nearai-fake-detector',
  metadata: {
    name: 'NEAR Example Agent',
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
  ],
};

const CrawlerAgent: Agent = {
  id: 'dapplets.near/agent/crawler',
  metadata: {
    name: 'Crawler Agent',
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

/*
const AssociativeSummarizer = {
  id: 'dapplets.near/agent/associative-summarizer',
  metadata: {
    name: 'Associative Summarizer',
  },
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
  ],
};
*/

const AllAgents = [
  SentimentAnalysis,
  FakeDetector,
  NearAiExampleAgent,
  CrawlerAgent,
]; // AssociativeSummarizer

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
