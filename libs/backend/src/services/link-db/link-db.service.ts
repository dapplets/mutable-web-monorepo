import { TransferableContext } from '../../types/transferable-context'
import { AppId } from '../application/application.entity'
import { MutationId } from '../mutation/mutation.entity'
import { LinkIndexRules, IndexObject, LinkedDataByAccountDto, CtxLink } from './link-db.entity'
import { DocumentId } from '../document/document.entity'
import { LinkDbRepository } from './link-db.repository'
import { Transaction } from '../unit-of-work/transaction'
import { UserLinkService } from '../user-link/user-link.service'

const DefaultIndexRules: LinkIndexRules = {
  namespace: true,
  type: true,
  parsed: { id: true },
}

const ContextLinkKey = 'ctxlink'
const KeyDelimiter = '/'

export class LinkDbService {
  constructor(private _linkDbRepository: LinkDbRepository) {}

  async set(
    mutationId: MutationId,
    appId: AppId,
    docId: DocumentId | null,
    context: TransferableContext, // ToDo: replace with IContextNode?
    dataByAccount: LinkedDataByAccountDto,
    indexRules: LinkIndexRules = DefaultIndexRules,
    tx?: Transaction
  ): Promise<void> {
    const accounts = Object.keys(dataByAccount)

    // ToDo: implement multiple accounts
    if (accounts.length !== 1) {
      throw new Error('Only one account can be written at a time')
    }

    const [accountId] = accounts

    const indexObject = LinkDbService._buildLinkIndex(mutationId, appId, docId, indexRules, context)
    const index = UserLinkService._hashObject(indexObject) // ToDo: the dependency is not injected

    const globalId = [accountId, ContextLinkKey, index].join(KeyDelimiter)

    const ctxLink = CtxLink.create({
      id: globalId,
      index: indexObject,
      data: dataByAccount[accountId],
    })

    await this._linkDbRepository.saveItem(ctxLink, tx)
  }

  async get(
    mutationId: MutationId,
    appId: AppId,
    docId: DocumentId | null,
    context: TransferableContext,
    accountIds?: string[] | string, // from any user by default
    indexRules: LinkIndexRules = DefaultIndexRules // use context id as index by default
  ): Promise<LinkedDataByAccountDto> {
    const indexObject = LinkDbService._buildLinkIndex(mutationId, appId, docId, indexRules, context)
    const index = UserLinkService._hashObject(indexObject) // ToDo: the dependency is not injected

    let ctxLinks: CtxLink[]

    if (!accountIds) {
      ctxLinks = await this._linkDbRepository.getItems({ localId: index })
    } else {
      accountIds = Array.isArray(accountIds) ? accountIds : [accountIds]

      const ctxLinkIds = accountIds.map((accountId) =>
        [accountId, ContextLinkKey, index].join(KeyDelimiter)
      )

      // ToDo: too much data will be retrieved here, becuase it created by users
      const ctxLinksNullPossible = await Promise.all(
        ctxLinkIds.map((id) => this._linkDbRepository.getItem(id))
      )
      ctxLinks = ctxLinksNullPossible.filter((x) => x !== null)
    }

    const dataByAuthor = Object.fromEntries(
      ctxLinks.map((ctxLink) => [ctxLink.authorId, ctxLink.data])
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
    const index: IndexObject = {
      context: LinkDbService._buildIndexedContextValues(indexRules, context),
    }

    // ToDo: non-obvious indexing. Documents are mutation-independent
    if (documentId) {
      // Document can be reused in different mutations and apps
      index.documentId = documentId
    } else {
      // MutationId is a part of the index.
      // It means that a data of the same application is different in different mutations
      index.mutationId = mutationId
      index.appId = appId
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
