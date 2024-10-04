import { Base, EntityId } from '../base/base.entity'
import { BaseRepository } from '../base/base.repository'
import { IStorage } from '../local-db/local-storage'
import { Transaction } from '../unit-of-work/transaction'

export class LifeCycleService<T extends Base> {
  constructor(
    private EntityType: { new (): T },
    public remote: BaseRepository<T>,
    public local: IStorage
  ) {}

  public async change(item: T): Promise<void> {
    const json = await this.local.getItem(item.id)

    const history: T[] = json ? JSON.parse(json) ?? [] : []

    history.push(item)

    await this.local.setItem(item.id, JSON.stringify(history))
  }

  public async publish(id: EntityId, tx?: Transaction): Promise<void> {
    const json = await this.local.getItem(id)

    const history: T[] = json ? JSON.parse(json) ?? [] : []

    const item = history.pop()

    if (!item) {
      throw new Error('No changes to publish')
    }

    // @ts-ignore
    const entity: T = this.EntityType.create(item)

    try {
      await this.remote.saveItem(entity, tx)
      await this.local.removeItem(entity.id)
    } catch (err) {
      throw err
    }
  }

  public async hasChanges(id: EntityId): Promise<boolean> {
    // ToDo: or compare timestamp?

    const json = await this.local.getItem(id)

    const history: T[] = json ? JSON.parse(json) ?? [] : []

    return history.length > 0
  }

  public async revert(id: EntityId): Promise<void> {
    const json = await this.local.getItem(id)

    const history: T[] = json ? JSON.parse(json) ?? [] : []

    // undo last change
    history.pop()

    await this.local.setItem(id, JSON.stringify(history))
  }

  public async cleanUp(id: EntityId): Promise<void> {
    while (await this.hasChanges(id)) {
      await this.revert(id)
    }
  }
}
