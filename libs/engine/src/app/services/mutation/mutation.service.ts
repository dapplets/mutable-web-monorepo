import { IContextNode } from '@mweb/core'
import { TargetService } from '../target/target.service'
import { Mutation, MutationId, MutationWithSettings } from './mutation.entity'
import { MutationRepository } from './mutation.repository'
import { Transaction } from '../unit-of-work/transaction'
import { UnitOfWorkService } from '../unit-of-work/unit-of-work.service'

export type SaveMutationOptions = {
  applyChangesToOrigin?: boolean
}

export class MutationService {
  constructor(
    private mutationRepository: MutationRepository,
    private unitOfWorkService: UnitOfWorkService,
    private nearConfig: { defaultMutationId: string }
  ) {}

  async getMutation(mutationId: string): Promise<Mutation | null> {
    const mutation = await this.mutationRepository.getItem(mutationId)
    return mutation
  }

  async getMutationsForContext(context: IContextNode): Promise<Mutation[]> {
    const mutations = await this.mutationRepository.getItems()
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

  async createMutation(
    mutation: Mutation,
    options?: SaveMutationOptions
  ): Promise<MutationWithSettings> {
    // ToDo: move to provider?
    if (await this.mutationRepository.getItem(mutation.id)) {
      throw new Error('Mutation with that ID already exists')
    }

    await this.unitOfWorkService.runInTransaction((tx) =>
      Promise.all([
        this.mutationRepository.createItem(mutation, tx),
        options?.applyChangesToOrigin && this._applyChangesToOrigin(mutation, tx),
      ])
    )

    return this.populateMutationWithSettings(mutation)
  }

  async editMutation(
    mutation: Mutation,
    options?: SaveMutationOptions,
    tx?: Transaction
  ): Promise<MutationWithSettings> {
    // ToDo: move to provider?
    if (!(await this.mutationRepository.getItem(mutation.id))) {
      throw new Error('Mutation with that ID does not exist')
    }

    const performTx = (tx: Transaction) =>
      Promise.all([
        this.mutationRepository.editItem(mutation, tx),
        options?.applyChangesToOrigin && this._applyChangesToOrigin(mutation, tx),
      ])

    // reuse transaction
    if (tx) {
      await performTx(tx)
    } else {
      await this.unitOfWorkService.runInTransaction(performTx)
    }

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

    // ToDo: do not mix MutationWithSettings and Mutation
    return (Mutation.create(mutation) as MutationWithSettings).copy({ settings: { lastUsage } })
  }

  private async _applyChangesToOrigin(forkedMutation: Mutation, tx?: Transaction) {
    const originalMutationId = forkedMutation.metadata.fork_of

    if (!originalMutationId) {
      throw new Error('The mutation is not a fork and does not have an origin to apply changes to')
    }

    const { authorId: forkAuthorId } = MutationService._parseMutationId(forkedMutation.id)
    const { authorId: originAuthorId } = MutationService._parseMutationId(originalMutationId)

    // ToDo: check logged in user id?
    if (forkAuthorId !== originAuthorId) {
      throw new Error('You cannot apply changes to the origin that is not your own')
    }

    const originalMutation = await this.mutationRepository.getItem(originalMutationId)

    if (!originalMutation) {
      throw new Error('The origin mutation does not exist')
    }

    // apply changes to origin
    originalMutation.apps = forkedMutation.apps
    originalMutation.metadata.description = forkedMutation.metadata.description
    originalMutation.targets = forkedMutation.targets

    await this.mutationRepository.editItem(originalMutation, tx)

    return originalMutation
  }

  private static _parseMutationId(mutationId: string): { authorId: string; localId: string } {
    const [authorId, , localId] = mutationId.split('/')
    return { authorId, localId }
  }
}
