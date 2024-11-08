import { AppId } from '../application/application.entity'
import { Transaction } from '../unit-of-work/transaction'
import { DocumentCommitDto } from './dtos/document-commit.dto'
import { LinkDbService } from '../link-db/link-db.service'
import { MutationId } from '../mutation/mutation.entity'
import { MutationService } from '../mutation/mutation.service'
import { Document, DocumentId } from './document.entity'
import { UnitOfWorkService } from '../unit-of-work/unit-of-work.service'
import { DocumentDto } from './dtos/document.dto'
import { DocumentCreateDto } from './dtos/document-create.dto'
import { IRepository } from '../base/repository.interface'
import { NearSigner } from '../near-signer/near-signer.service'
import { EntitySourceType } from '../base/base.entity'
import { MutationDto } from '../mutation/dtos/mutation.dto'

export class DocumentSerivce {
  constructor(
    private documentRepository: IRepository<Document>,
    private mutationService: MutationService,
    private unitOfWorkService: UnitOfWorkService,
    private nearSigner: NearSigner
  ) {}

  async getDocument(
    globalDocumentId: DocumentId,
    source?: EntitySourceType
  ): Promise<DocumentDto | null> {
    const document = await this.documentRepository.getItem(globalDocumentId, source)
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

  async saveDocument(dto: DocumentDto, tx?: Transaction): Promise<DocumentDto> {
    const document = await this.documentRepository.constructItem(dto)
    await this.documentRepository.saveItem(document, tx)
    return document.toDto()
  }

  async commitDocumentToMutation(
    mutationId: MutationId,
    appId: AppId,
    dto: DocumentCommitDto
  ): Promise<{ mutation?: MutationDto; document: DocumentDto }> {
    // ToDo
    dto.openWith = [appId]

    if (dto.source === EntitySourceType.Local) {
      // ToDo: non-obvious API
      const document =
        'id' in dto ? Document.create(dto) : await this.documentRepository.constructItem(dto)
      await this.documentRepository.saveItem(document)
      return { document }
    }

    const loggedInAccountId = await this.nearSigner.getAccountId()
    if (!loggedInAccountId) {
      throw new Error('Not logged in')
    }

    const mutation = await this.mutationService.getMutation(mutationId)

    if (!mutation) {
      throw new Error('No mutation with that ID')
    }

    const appInstances = mutation.apps.filter((app) => app.appId === appId)

    if (!dto.id) {
      // ^ create new document and replace empty document in the mutation with created one
      const document = await this.documentRepository.constructItem({ ...dto, openWith: [appId] })

      // ToDo: handle multiple app instances
      const instance = appInstances.find((app) => app.documentId === null)

      if (!instance) {
        throw new Error('No app in mutation with that ID and empty document')
      }

      // replace empty document in the mutation
      instance.documentId = document.id

      const [savedDocument, savedMutation] = await this.unitOfWorkService.runInTransaction((tx) =>
        Promise.all([
          this.documentRepository.createItem(document, tx),
          this.mutationService.editMutation(mutation, undefined, tx), // ToDo: undefined
        ])
      )

      return {
        document: savedDocument.toDto(),
        mutation: savedMutation,
      }
    }

    const document = Document.create(dto)

    if (document.authorId === loggedInAccountId) {
      // ^ edit document and don't touch the mutation
      await this.documentRepository.saveItem(document)

      if (mutation.source === EntitySourceType.Origin) {
        //  make mutation local
        mutation.source = EntitySourceType.Local
        const savedMutation = await this.mutationService.saveMutation(mutation)
        return {
          document: document.toDto(),
          mutation: savedMutation,
        }
      }

      return {
        document: document.toDto(),
      }
    } else if (document.authorId !== loggedInAccountId) {
      // ^ fork document, remove local changes and replace original document in the mutation with created one
      const originalDocumentId = dto.id

      const documentFork = await this.documentRepository.constructItem({
        ...dto,
        metadata: {
          ...dto.metadata,
          fork_of: originalDocumentId,
        },
      })

      // ToDo: handle multiple app instances
      const instance = appInstances.find((app) => app.documentId === originalDocumentId)

      if (!instance) {
        throw new Error('No app in mutation with that ID and empty document')
      }

      // replace empty document in the mutation
      instance.documentId = documentFork.id

      const [savedDocument] = await this.unitOfWorkService.runInTransaction((tx) =>
        Promise.all([this.documentRepository.createItem(documentFork, tx)])
      )

      // save mutation locally
      mutation.source = EntitySourceType.Local

      const savedMutation = await this.mutationService.saveMutation(mutation)

      return {
        document: savedDocument.toDto(),
        mutation: savedMutation,
      }
    }

    throw new Error('Unreachable code')
  }

  async deleteLocalDocument(documentId: DocumentId): Promise<void> {
    await this.documentRepository.deleteItem(documentId)
  }
}
