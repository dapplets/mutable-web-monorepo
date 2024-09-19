import { TransferableContext } from '../../common/transferable-context'
import { AppId } from '../application/application.entity'
import { Transaction } from '../unit-of-work/transaction'
import { LinkedDataByAccountDto } from '../link-db/link-db.entity'
import { LinkDbService } from '../link-db/link-db.service'
import { MutationId } from '../mutation/mutation.entity'
import { MutationService } from '../mutation/mutation.service'
import { Document, DocumentId } from './document.entity'
import { DocumentRepository } from './document.repository'
import { UnitOfWorkService } from '../unit-of-work/unit-of-work.service'
import { DocumentDto } from './dtos/document.dto'

export class DocumentSerivce {
  constructor(
    private documentRepository: DocumentRepository,
    private linkDbService: LinkDbService,
    private mutationService: MutationService,
    private unitOfWorkService: UnitOfWorkService
  ) {}

  async getDocument(globalDocumentId: DocumentId): Promise<DocumentDto | null> {
    const document = await this.documentRepository.getItem(globalDocumentId)
    return document ? this._toDto(document) : null
  }

  async getDocumentsByAppId(globalAppId: AppId): Promise<Document[]> {
    return this.documentRepository.getItemsByIndex({ openWith: [globalAppId] })
  }

  async createDocument(document: Document, tx?: Transaction): Promise<Document> {
    return this.documentRepository.createItem(document, tx)
  }

  async createDocumentWithData(
    mutationId: MutationId,
    appId: AppId,
    document: Document,
    ctx: TransferableContext,
    dataByAccount: LinkedDataByAccountDto
  ) {
    if (await this.documentRepository.getItem(document.id)) {
      throw new Error('Document with that ID already exists')
    }

    // ToDo: move to mutation service?

    const mutation = await this.mutationService.getMutation(mutationId)

    if (!mutation) {
      throw new Error('No mutation with that ID')
    }

    // ToDo: handle multiple app instances
    const app = mutation.apps.find((app) => app.appId === appId && app.documentId === null)

    if (!app) {
      throw new Error('No app in mutation with that ID and empty document')
    }

    app.documentId = document.id

    await this.unitOfWorkService.runInTransaction((tx) =>
      Promise.all([
        this.createDocument(document, tx),
        this.mutationService.editMutation(mutation, undefined, tx), // ToDo: undefined
        this.linkDbService.set(mutationId, appId, document.id, ctx, dataByAccount, undefined, tx),
      ])
    )

    return { mutation }
  }

  private _toDto(document: Document): DocumentDto {
    return {
      id: document.id,
      localId: document.localId,
      authorId: document.authorId,
      metadata: document.metadata,
      openWith: document.openWith,
    }
  }
}
