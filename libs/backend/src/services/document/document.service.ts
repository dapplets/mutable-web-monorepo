import { TransferableContext } from '../../types/transferable-context'
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
import { DocumentCreateDto } from './dtos/document-create.dto'

export class DocumentSerivce {
  constructor(
    private documentRepository: DocumentRepository,
    private linkDbService: LinkDbService,
    private mutationService: MutationService,
    private unitOfWorkService: UnitOfWorkService
  ) {}

  async getDocument(globalDocumentId: DocumentId): Promise<DocumentDto | null> {
    const document = await this.documentRepository.getItem(globalDocumentId)
    return document?.toDto() ?? null
  }

  async getDocumentsByAppId(globalAppId: AppId): Promise<DocumentDto[]> {
    return this.documentRepository.getItemsByIndex({ openWith: [globalAppId] })
  }

  async createDocument(dto: DocumentCreateDto, tx?: Transaction): Promise<DocumentDto> {
    const document = await this.documentRepository.constructItem(dto)
    await this.documentRepository.createItem(document, tx)
    return document.toDto()
  }

  async createDocumentWithData(
    mutationId: MutationId,
    appId: AppId,
    dto: DocumentCreateDto,
    ctx: TransferableContext,
    dataByAccount: LinkedDataByAccountDto
  ) {
    const document = await this.documentRepository.constructItem(dto)

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
}
