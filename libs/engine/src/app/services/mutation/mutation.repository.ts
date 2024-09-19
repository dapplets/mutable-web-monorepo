import { LocalDbService } from '../local-db/local-db.service'
import { SocialDbService } from '../social-db/social-db.service'
import { Mutation } from './mutation.entity'
import { BaseRepository } from '../base/base.repository'

// Local DB
const FAVORITE_MUTATION = 'favorite-mutation'
const MUTATION_LAST_USAGE = 'mutation-last-usage'

export class MutationRepository extends BaseRepository<Mutation> {
  constructor(
    socialDb: SocialDbService,
    private localDb: LocalDbService
  ) {
    super(Mutation, socialDb)
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
