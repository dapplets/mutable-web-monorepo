import { Injectable } from '@nestjs/common';
import { ContextNode } from 'src/context/entities/context-node.entity';
import { utils } from '@mweb/backend';
import { InjectRepository } from '@nestjs/typeorm';
import { Agent } from './agent.entity';
import { Repository } from 'typeorm';

export type MWebAgent = {
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
  rate: number;
  targets: any[];
};

const SentimentAnalysis: MWebAgent = {
  id: 'dapplets.near/agent/sentiment-analysis',
  metadata: {
    name: 'Sentiment Analysis',
    description: 'Simple Agent for Crawler',
    image: {
      ipfs_cid: 'bafkreiewyhqbg3jbfpyqnbxqlgr44xsojda3lb7k3owgzz6b3emoibfa7y',
    },
  },
  type: 'openfaas',
  image: 'ghcr.io/dapplets/sentiment-analysis-agent:latest',
  rate: 0.081, // per hour
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

const FakeDetector: MWebAgent = {
  id: 'dapplets.near/agent/fake-detector',
  metadata: {
    name: 'Fake Detector',
    image: {
      ipfs_cid: 'bafkreicoxkzxvf4ic4qcmkte3sdqykzwdyfyyiklfnygl7ujqy2izu7ig4',
    },
  },
  type: 'openfaas',
  image: 'ghcr.io/dapplets/fake-detector-agent:latest',
  rate: 0.023, // per hour
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

const NearAiFakeDetectorAgent: MWebAgent = {
  id: 'dapplets.near/agent/nearai-fake-detector',
  metadata: {
    name: 'NEAR AI Fake Detector',
    image: {
      ipfs_cid: 'bafkreihwh62hu635x34i2cm373e3o332ikbuvublen7oc5epiophx3gdoy',
    },
  },
  type: 'nearai',
  rate: 0.531, // per hour
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

const CrawlerAgent: MWebAgent = {
  id: 'dapplets.near/agent/crawler',
  metadata: {
    name: 'AI Crawler Agent',
    image: {
      ipfs_cid: 'bafkreihnq7xmeohi2qdgryt2wtyk3rtfcaid67kj3kj6iwiqix53eybmdy',
    },
  },
  rate: 0.09, // per hour
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

const AssociativeSummarizer: MWebAgent = {
  id: 'dapplets.near/agent/associative-summarizer',
  metadata: {
    name: 'Associative Summarizer',
    image: {
      ipfs_cid: 'bafkreifsik7injgqttmem6clzu5xjowp3hytc2xrvpgfnbjis7b2yteq7e',
    },
  },
  type: 'openfaas',
  rate: 0.087, // per hour
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
  constructor(
    @InjectRepository(Agent)
    private ordersRepository: Repository<Agent>,
  ) {}

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

  async addAgentConsumption(agentId: string, consumed: number) {
    let agent = await this.ordersRepository.findOne({
      where: { id: agentId },
    });

    if (!agent) {
      agent = new Agent();
      agent.id = agentId;
      agent.consumption = 0;
    }

    // add time
    agent.consumption += consumed;

    return this.ordersRepository.save(agent);
  }
}
