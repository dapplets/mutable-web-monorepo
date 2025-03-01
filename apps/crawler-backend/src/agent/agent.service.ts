import { Injectable } from '@nestjs/common';

const SimpleAgent = {
  id: 'dapplets.near/agent/simple-agent',
  metadata: {
    name: 'Simple Agent',
    description: 'Simple Agent for Crawler',
  },
  image: 'ghcr.io/dapplets/simple-agent:latest',
  inputSchema: 'dapplets.near/schema/post',
  outputSchema: 'dapplets.near/schema/simple-agent-response',
};

@Injectable()
export class AgentService {
  async getAgents() {
    return [SimpleAgent];
  }

  async getAgentsByInputSchema(inputSchema: string) {
    if (inputSchema === SimpleAgent.inputSchema) {
      return [SimpleAgent];
    } else {
      return [];
    }
  }
}
