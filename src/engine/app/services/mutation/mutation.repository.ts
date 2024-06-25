import { LocalDbService } from '../local-db/local-db.service'
import { SocialDbService } from '../social-db/social-db.service'
import { Mutation, MutationId } from './mutation.entity'

// ToDo: move to repository?
const ProjectIdKey = 'dapplets.near'
const SettingsKey = 'settings'
const MutationKey = 'mutation'
const WildcardKey = '*'
const RecursiveWildcardKey = '**'
const KeyDelimiter = '/'

// Local DB
const FAVORITE_MUTATION = 'favorite-mutation'
const MUTATION_LAST_USAGE = 'mutation-last-usage'

export class MutationRepository {
  constructor(
    private socialDb: SocialDbService,
    private localDb: LocalDbService
  ) {}

  async getMutation(globalMutationId: MutationId): Promise<Mutation | null> {
    const [authorId, , mutationLocalId] = globalMutationId.split(KeyDelimiter)

    const keys = [authorId, SettingsKey, ProjectIdKey, MutationKey, mutationLocalId]
    const queryResult = await this.socialDb.get([
      [...keys, RecursiveWildcardKey].join(KeyDelimiter),
    ])

    const mutation = SocialDbService.getValueByKey(keys, queryResult)

    if (!mutation) return null

    return {
      id: globalMutationId,
      metadata: mutation.metadata,
      apps: mutation.apps ? JSON.parse(mutation.apps) : [],
      targets: mutation.targets ? JSON.parse(mutation.targets) : [],
    }
  }

  async getMutations(): Promise<Mutation[]> {
    const keys = [
      WildcardKey, // any author id
      SettingsKey,
      ProjectIdKey,
      MutationKey,
      WildcardKey, // any mutation local id
    ]

    const queryResult = await this.socialDb.get([
      [...keys, RecursiveWildcardKey].join(KeyDelimiter),
    ])

    const mutationsByKey = SocialDbService.splitObjectByDepth(queryResult, keys.length)

    const mutations = Object.entries(mutationsByKey).map(([key, mutation]: [string, any]) => {
      const [accountId, , , , localMutationId] = key.split(KeyDelimiter)
      const mutationId = [accountId, MutationKey, localMutationId].join(KeyDelimiter)

      return {
        id: mutationId,
        metadata: mutation.metadata,
        apps: mutation.apps ? JSON.parse(mutation.apps) : [],
        targets: mutation.targets ? JSON.parse(mutation.targets) : [],
      }
    })

    return mutations
  }

  async saveMutation(mutation: Mutation): Promise<Mutation> {
    const [authorId, , mutationLocalId] = mutation.id.split(KeyDelimiter)

    const keys = [authorId, SettingsKey, ProjectIdKey, MutationKey, mutationLocalId]

    const storedAppMetadata = {
      metadata: mutation.metadata,
      targets: mutation.targets ? JSON.stringify(mutation.targets) : null,
      apps: mutation.apps ? JSON.stringify(mutation.apps) : null,
    }

    await this.socialDb.set(SocialDbService.buildNestedData(keys, storedAppMetadata))

    return mutation
  }

  async getFavoriteMutation(): Promise<string | null | undefined> {
    const key = LocalDbService.makeKey(FAVORITE_MUTATION, window.location.hostname)
    return this.localDb.getItem(key)
  }

  async setFavoriteMutation(mutationId: string | null | undefined): Promise<void> {
    const key = LocalDbService.makeKey(FAVORITE_MUTATION, window.location.hostname)
    return this.localDb.setItem(key, mutationId)
  }

  async getMutationLastUsage(mutationId: string, hostname: string): Promise<string | null> {
    const key = LocalDbService.makeKey(MUTATION_LAST_USAGE, mutationId, hostname)
    return (await this.localDb.getItem(key)) ?? null
  }

  async setMutationLastUsage(
    mutationId: string,
    value: string | null,
    hostname: string
  ): Promise<void> {
    const key = LocalDbService.makeKey(MUTATION_LAST_USAGE, mutationId, hostname)
    return this.localDb.setItem(key, value)
  }
}
