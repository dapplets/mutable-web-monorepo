import { Transaction } from './transaction'
import { SocialDbService } from '../social-db/social-db.service'

export class UnitOfWorkService {
  constructor(private _socialDb: SocialDbService) {}

  async runInTransaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    const tx = new Transaction(this._socialDb)

    const result = await callback(tx)

    await tx.commit()

    // ToDo: revert changes

    return result
  }
}
