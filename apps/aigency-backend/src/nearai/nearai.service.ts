import { Injectable } from '@nestjs/common';
import {
  RegistryApi,
  AssistantsApi,
  Configuration,
  ThreadsApi,
} from '@mweb/near-ai-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NearAiService {
  private registry: RegistryApi;
  private assistants: AssistantsApi;
  private threads: ThreadsApi;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('NEAR_AI_API_KEY')!;

    const config = new Configuration({
      basePath: 'https://api.near.ai',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    this.registry = new RegistryApi(config);
    this.assistants = new AssistantsApi(config);
    this.threads = new ThreadsApi(config);
  }

  async getAgentsForUser(nearAccountId: string) {
    const entries = await this._paginate(({ offset, total }) =>
      this.registry.listEntriesV1RegistryListEntriesPost({
        starredBy: nearAccountId,
        showHidden: false,
        showLatestVersion: true,
        offset,
        total,
      }),
    );

    return entries.map((entry) => ({
      domain: 'Near AI',
      name: `${entry.namespace}/${entry.name}`,

      // @ts-expect-error poor types in near-ai-client
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      title: entry.details?.agent?.welcome?.title as string,

      description:
        // @ts-expect-error poor types in near-ai-client
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        [entry.description, entry.details?.agent?.welcome?.description]
          .filter((x) => !!x)
          .join('\n'),

      stars: entry.numStars,
    }));
  }

  public async callAgent(
    agentId: string,
    message: { text?: string },
  ): Promise<{ text?: string } | null> {
    if (!message?.text) return null;

    const threadId = await this.assistants.runAgentV1ThreadsRunsPost({
      createThreadAndRunRequest: {
        agentId: `${agentId}/latest`,
        newMessage: message?.text,
      },
    });

    const messages =
      await this.threads.listMessagesV1ThreadsThreadIdMessagesGet({
        threadId,
      });

    // https://github.com/nearai/nearai/blob/e4b838f3a15dc26d7de63c95381c02354a0b9d5d/hub/demo/src/components/AgentRunner.tsx#L229
    const answers = messages.data.filter(
      (msg) =>
        !(
          msg.metadata?.message_type?.startsWith('system:') ||
          msg.metadata?.message_type?.startsWith('agent:log')
        ),
    );

    const text = answers[0]?.content[0]?.text?.value;

    return text ? { text } : null;
  }

  private async _paginate<T>(
    callback: ({
      offset,
      total,
    }: {
      offset: number;
      total: number;
    }) => Promise<T[]>,
  ): Promise<T[]> {
    const limit = 20;

    let offset = 0;
    let allResults: T[] = [];
    let hasMore = true;

    while (hasMore) {
      const results = await callback({ offset, total: limit });

      // Wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));

      allResults = allResults.concat(results);

      if (results.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    return allResults;
  }
}
