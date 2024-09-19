import { mergeDeep } from '../../common/merge-deep'
import { SocialDbService, Value } from '../social-db/social-db.service'

export class Transaction {
  private _state: Value = {}

  constructor(private _socialDb: SocialDbService) {}

  public queue(data: Value) {
    this._state = mergeDeep(this._state, data)
  }

  public async commit(): Promise<void> {
    await this._socialDb.set(this._state)
  }
}
