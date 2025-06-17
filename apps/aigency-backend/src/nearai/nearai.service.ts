import { Injectable } from '@nestjs/common';
import { RegistryApi, Configuration } from '@mweb/near-ai-client';

@Injectable()
export class NearAiService {
  constructor() {}

  async getAgentsForUser(nearAccountId: string) {
    const config = new Configuration({ basePath: 'https://api.near.ai' });
    const registry = new RegistryApi(config);

    const entries = await this._paginate(({ offset, total }) =>
      registry.listEntriesV1RegistryListEntriesPost({
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
