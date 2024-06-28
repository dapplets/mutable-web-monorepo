import { IContextNode, PureContextNode } from '../../../../core'
import { TargetService } from '../target/target.service'
import { Mutation, MutationId, MutationWithSettings } from './mutation.entity'
import { MutationRepository } from './mutation.repository'

export class MutationService {
  constructor(
    private mutationRepository: MutationRepository,
    private nearConfig: { defaultMutationId: string }
  ) {}

  async getMutation(mutationId: string): Promise<Mutation | null> {
    return this.mutationRepository.getMutation(mutationId)
  }

  async getMutationsForContext(context: IContextNode): Promise<Mutation[]> {
    const mutations = await this.mutationRepository.getMutations()
    return mutations.filter((mutation) =>
      mutation.targets.some((target) => TargetService.isTargetMet(target, context))
    )
  }

  async getMutationsWithSettings(context: IContextNode): Promise<MutationWithSettings[]> {
    const mutations = await this.getMutationsForContext(context)

    return Promise.all(mutations.map((mut) => this.populateMutationWithSettings(mut)))
  }

  getLastUsedMutation = async (context: IContextNode): Promise<string | null> => {
    const allMutations = await this.getMutationsWithSettings(context)
    const hostname = window.location.hostname
    const lastUsedData = await Promise.all(
      allMutations.map(async (m) => ({
        id: m.id,
        lastUsage: await this.mutationRepository.getMutationLastUsage(m.id, hostname),
      }))
    )
    const usedMutationsData = lastUsedData
      .filter((m) => m.lastUsage)
      .map((m) => ({ id: m.id, lastUsage: new Date(m.lastUsage!).getTime() }))

    if (usedMutationsData?.length) {
      if (usedMutationsData.length === 1) return usedMutationsData[0].id
      let lastMutation = usedMutationsData[0]
      for (let i = 1; i < usedMutationsData.length; i++) {
        if (usedMutationsData[i].lastUsage > lastMutation.lastUsage) {
          lastMutation = usedMutationsData[i]
        }
      }
      return lastMutation.id
    } else {
      // Activate default mutation for new users
      return this.nearConfig.defaultMutationId
    }
  }

  async setFavoriteMutation(mutationId: string | null): Promise<void> {
    return this.mutationRepository.setFavoriteMutation(mutationId)
  }

  async getFavoriteMutation(): Promise<string | null> {
    const value = await this.mutationRepository.getFavoriteMutation()
    return value ?? null
  }

  async createMutation(mutation: Mutation): Promise<MutationWithSettings> {
    // ToDo: move to provider?
    if (await this.mutationRepository.getMutation(mutation.id)) {
      throw new Error('Mutation with that ID already exists')
    }

    await this.mutationRepository.saveMutation(mutation)

    return this.populateMutationWithSettings(mutation)
  }

  async editMutation(mutation: Mutation): Promise<MutationWithSettings> {
    await this.mutationRepository.saveMutation(mutation)

    return this.populateMutationWithSettings(mutation)
  }

  async removeMutationFromRecents(mutationId: MutationId): Promise<void> {
    await this.mutationRepository.setMutationLastUsage(mutationId, null, window.location.hostname)
  }

  public async updateMutationLastUsage(mutationId: MutationId, hostname: string): Promise<string> {
    // save last usage
    const currentDate = new Date().toISOString()
    await this.mutationRepository.setMutationLastUsage(mutationId, currentDate, hostname)
    return currentDate
  }

  public async populateMutationWithSettings(mutation: Mutation): Promise<MutationWithSettings> {
    const lastUsage = await this.mutationRepository.getMutationLastUsage(
      mutation.id,
      window.location.hostname
    )

    return {
      ...mutation,
      settings: {
        lastUsage,
      },
    }
  }
}
