import serializeToDeterministicJson from 'json-stringify-deterministic'

import { SocialDbService } from '../social-db/social-db.service'
import { TransferableContext } from '../../common/transferable-context'
import { AppId } from '../application/application.entity'
import { MutationId } from '../mutation/mutation.entity'
import { UserLinkRepository } from '../user-link/user-link.repository'
import { LinkIndexRules, IndexObject, LinkedDataByAccount } from './link-db.entity'
import { DocumentId } from '../document/document.entity'

const DefaultIndexRules: LinkIndexRules = {
  namespace: true,
  type: true,
  parsed: { id: true },
}

const ProjectIdKey = 'dapplets.near'
const SettingsKey = 'settings'
const ContextLinkKey = 'ctxlink'
const WildcardKey = '*'
const KeyDelimiter = '/'
const DataKey = 'data'
const IndexKey = 'index'

export class LinkDbService {
  constructor(private _socialDb: SocialDbService) {}

  async set(
    mutationId: MutationId,
    appId: AppId,
    docId: DocumentId | null,
    context: TransferableContext, // ToDo: replace with IContextNode?
    dataByAccount: LinkedDataByAccount,
    indexRules: LinkIndexRules = DefaultIndexRules
  ): Promise<void> {
    const accounts = Object.keys(dataByAccount)

    // ToDo: implement multiple accounts
    if (accounts.length !== 1) {
      throw new Error('Only one account can be written at a time')
    }

    const [accountId] = accounts

    const indexObject = LinkDbService._buildLinkIndex(mutationId, appId, docId, indexRules, context)
    const index = UserLinkRepository._hashObject(indexObject) // ToDo: the dependency is not injected

    const keys = [accountId, SettingsKey, ProjectIdKey, ContextLinkKey, index]

    const dataToStore = {
      [DataKey]: serializeToDeterministicJson(dataByAccount[accountId]),
      [IndexKey]: indexObject,
    }

    await this._socialDb.set(SocialDbService.buildNestedData(keys, dataToStore))
  }

  async get(
    mutationId: MutationId,
    appId: AppId,
    docId: DocumentId | null,
    context: TransferableContext,
    accountIds: string[] | string = [WildcardKey], // from any user by default
    indexRules: LinkIndexRules = DefaultIndexRules // use context id as index by default
  ): Promise<LinkedDataByAccount> {
    const indexObject = LinkDbService._buildLinkIndex(mutationId, appId, docId, indexRules, context)
    const index = UserLinkRepository._hashObject(indexObject) // ToDo: the dependency is not injected

    accountIds = Array.isArray(accountIds) ? accountIds : [accountIds]

    const keysArr = accountIds.map((accountId) => [
      accountId,
      SettingsKey,
      ProjectIdKey,
      ContextLinkKey,
      index,
      DataKey,
    ])

    // ToDo: too much data will be retrieved here, becuase it created by users

    // ToDo: batch requests
    const resp = await this._socialDb.get(keysArr.map((keys) => keys.join(KeyDelimiter)))

    const links = SocialDbService.splitObjectByDepth(resp, 6) // 6 is a number of keys in keysArr

    const dataByAuthor = Object.fromEntries(
      Object.entries(links).map(([key, json]) => {
        const [authorId] = key.split(KeyDelimiter)
        const data = json ? JSON.parse(json as string) : undefined
        return [authorId, data]
      })
    )

    return dataByAuthor
  }

  static _buildLinkIndex(
    mutationId: MutationId,
    appId: AppId,
    documentId: DocumentId | null,
    indexRules: LinkIndexRules,
    context: TransferableContext
  ): IndexObject {
    // MutationId is a part of the index.
    // It means that a data of the same application is different in different mutations

    const index: IndexObject = {
      mutationId,
      appId,
      context: LinkDbService._buildIndexedContextValues(indexRules, context),
    }

    if (documentId) {
      index.documentId = documentId
    }

    return index
  }

  static _buildIndexedContextValues(indexes: any, values: any): any {
    const out: any = {}

    for (const prop in indexes) {
      if (!indexes[prop]) continue

      // ToDo: will not work with arrays
      if (typeof values[prop] === 'object') {
        out[prop] = LinkDbService._buildIndexedContextValues(indexes[prop], values[prop])
      } else {
        out[prop] = values[prop]
      }
    }

    return out
  }
}
