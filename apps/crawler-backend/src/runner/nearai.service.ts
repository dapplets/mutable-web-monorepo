import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MWebAgent } from 'src/agent/agent.service';
import { ContextNode } from 'src/context/entities/context-node.entity';
import { IRunnerService } from './runner.interface';

@Injectable()
export class NearAiService implements IRunnerService {
  private logger = new Logger(NearAiService.name);
  private _apiKey: string;

  constructor(private configService: ConfigService) {
    const config = this.configService;
    this._apiKey = config.getOrThrow('NEARAI_API_KEY');
  }

  async run({ agent, context }: { agent: MWebAgent; context: ContextNode }) {
    const agentId = agent.image;
    const inputData = JSON.stringify({
      context: {
        namespace: context.metadata.namespace,
        contextType: context.metadata.contextType,
        id: context.metadata.id,
        parsedContext: context.content,
      },
    });

    const runId = await this.startAgent(agentId, inputData);
    this.logger.debug(`✅ Agent started. Run ID: ${runId}`);

    // Wait for agent to process
    // await new Promise((resolve) => setTimeout(resolve, 10000));

    const response = await this.getMessageContent(runId);

    if (!response) {
      throw new Error('No response from agent');
    }

    this.logger.debug(`Messages retrieved: ${JSON.stringify(response)}`);

    const result = JSON.parse(response);

    return result;
  }

  private async startAgent(agentId: string, input: string): Promise<string> {
    const headers = {
      Authorization: `Bearer ${this._apiKey}`,
      'Content-Type': 'application/json',
    };

    const payload = {
      agent_id: agentId,
      new_message: input,
      max_iterations: '1',
    };

    const THREADS_RUN_URL = 'https://api.near.ai/v1/threads/runs';

    const response = await fetch(THREADS_RUN_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.text();

    if (!response.ok) {
      throw new Error(`Error starting agent: ${data}`);
    }

    return data.trim().replace(/"/g, '');
  }

  private async getMessageContent(runId: string): Promise<string> {
    const headers = { Authorization: `Bearer ${this._apiKey}` };
    const THREADS_MESSAGES_URL = (runId: string) =>
      `https://api.near.ai/v1/threads/${runId}/messages`;

    const response = await fetch(THREADS_MESSAGES_URL(runId), {
      method: 'GET',
      headers,
    });

    if (!response.ok) return null;

    const responseData = await response.json();
    const messages = responseData.data || [];

    if (messages.length === 0) return null;

    const lastMessage = messages[0];

    if (lastMessage.role !== 'assistant') return null;

    if (lastMessage.content.length === 0) return null;

    const lastContent = lastMessage.content[0];

    if (lastContent.type !== 'text') return null;

    return lastContent.text.value;
  }
}
