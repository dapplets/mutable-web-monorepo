import { LocalDbService } from '../local-db/local-db.service'
import { SocialDbService, Value } from '../social-db/social-db.service'
import { Mutation } from './mutation.entity'
import { BaseRepository } from '../base/base.repository'

// ToDo: move to repository?
const ProjectIdKey = 'dapplets.near'
const SettingsKey = 'settings'
const MutationKey = 'mutation'
const KeyDelimiter = '/'

// Local DB
const FAVORITE_MUTATION = 'favorite-mutation'
const MUTATION_LAST_USAGE = 'mutation-last-usage'

export class MutationRepository extends BaseRepository<Mutation> {
  constructor(
    public socialDb: SocialDbService,
    private localDb: LocalDbService
  ) {
    super(Mutation, socialDb)
  }

  async saveMutation(mutation: Mutation): Promise<Mutation> {
    const preparedMutation = await this.prepareSaveMutation(mutation)

    await this.socialDb.set(preparedMutation)

    return mutation
  }

  async prepareSaveMutation(mutation: Mutation): Promise<Value> {
    const [authorId, , mutationLocalId] = mutation.id.split(KeyDelimiter)

    const keys = [authorId, SettingsKey, ProjectIdKey, MutationKey, mutationLocalId]

    const denormalizedApps = mutation.apps.map((app) => (app.documentId ? app : app.appId))

    const storedAppMetadata = {
      metadata: mutation.metadata,
      targets: mutation.targets ? JSON.stringify(mutation.targets) : null,
      apps: mutation.apps ? JSON.stringify(denormalizedApps) : null,
    }

    return SocialDbService.buildNestedData(keys, storedAppMetadata)
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
