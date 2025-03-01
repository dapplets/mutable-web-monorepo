import { Injectable } from '@nestjs/common';
import { ContextNode } from 'src/context/entities/context-node.entity';
import { utils } from '@mweb/backend';

const SentimentAnalysis = {
  id: 'dapplets.near/agent/sentiment-analysis',
  metadata: {
    name: 'Simple Agent',
    description: 'Simple Agent for Crawler',
  },
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

const FakeDetector = {
  id: 'dapplets.near/agent/fake-detector',
  metadata: {
    name: 'Fake Detector',
  },
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

const AllAgents = [SentimentAnalysis, FakeDetector];

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
