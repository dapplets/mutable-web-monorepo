import { AppId } from '../application/application.entity'
import { Transaction } from '../unit-of-work/transaction'
import { DocumentCommitDto } from './dtos/document-commit.dto'
import { MutationId } from '../mutation/mutation.entity'
import { MutationService } from '../mutation/mutation.service'
import { Document, DocumentId } from './document.entity'
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
    private nearSigner: NearSigner
  ) {}

  async getDocument(
    globalDocumentId: DocumentId,
    source?: EntitySourceType
  ): Promise<DocumentDto | null> {
    const document = await this.documentRepository.getItem({ id: globalDocumentId, source })
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
    const mutation = await this.mutationService.getMutation(mutationId)

    if (!mutation) {
      throw new Error('No mutation with that ID')
    }

    // ToDo
    dto.openWith = [appId]

    if (dto.id) {
      if (dto.source === EntitySourceType.Local) {
        return this._editLocalDocumentInMutation(mutation, dto)
      } else {
        return this._editRemoteDocumentInMutation(mutation, appId, dto)
      }
    } else {
      if (dto.source === EntitySourceType.Local) {
        return this._createLocalDocumentInMutation(mutation, appId, dto)
      } else {
        return this._createRemoteDocumentInMutation(mutation, appId, dto)
      }
    }
  }

  async deleteLocalDocument(documentId: DocumentId): Promise<void> {
    await this.documentRepository.deleteItem(documentId)
  }

  private async _createLocalDocumentInMutation(
    mutation: MutationDto,
    appId: AppId,
    dto: DocumentCreateDto
  ): Promise<{ mutation?: MutationDto; document: DocumentDto }> {
    // create document locally, make mutation local, add id to mutation

    const document = await this.documentRepository.constructItem(dto)
    await this.documentRepository.saveItem(document) // ToDo: or createItem?

    // ToDo: null authorId is possible here
    // can be null if mutation was locally edited before
    const editingMutation = this._replaceAppInstance(mutation, appId, null, document.id)

    if (editingMutation || mutation.source === EntitySourceType.Origin) {
      const savedMutation = await this.mutationService.saveMutation({
        ...(editingMutation ?? mutation),
        source: EntitySourceType.Local,
      })

      return { document, mutation: savedMutation }
    }

    return { document }
  }

  private async _createRemoteDocumentInMutation(
    mutation: MutationDto,
    appId: AppId,
    dto: DocumentCreateDto
  ): Promise<{ mutation?: MutationDto; document: DocumentDto }> {
    const loggedInAccountId = await this.nearSigner.getAccountId()
    if (!loggedInAccountId) throw new Error('Not logged in')

    const document = await this.documentRepository.constructItem(dto)

    // ToDo: should mutation be saved locally or remote?
    // if (mutation.authorId === loggedInAccountId) {
    //   // create document remotely, add id to mutation remotely ? (need to be merged)

    //   // can be null if mutation was locally edited before
    //   const editingMutation = this._replaceAppInstance(mutation, appId, null, document.id)

    //   if (!editingMutation) {
    //     throw new Error('No app in mutation with that ID and empty document')
    //   }

    //   const [savedDocument, savedMutation] = await this.unitOfWorkService.runInTransaction((tx) =>
    //     Promise.all([
    //       this.documentRepository.createItem(document, tx),
    //       this.mutationService.editMutation(
    //         { ...editingMutation, source: EntitySourceType.Origin },
    //         undefined,
    //         tx
    //       ), // ToDo: undefined
    //     ])
    //   )

    //   return {
    //     document: savedDocument.toDto(),
    //     mutation: savedMutation,
    //   }
    // } else {
    // create document remotely, make mutation local, add id to mutation

    const savedDocument = await this.documentRepository.createItem(document)

    if (
      !mutation.apps.some((app) => app.appId === appId && app.documentId === document.id) ||
      mutation.source === EntitySourceType.Origin
    ) {
      // ToDo: navie implementation
      mutation.apps = mutation.apps
        .filter((app) => !(app.appId === appId && app.documentId === null)) // remove apps without documents
        .concat({ appId, documentId: document.id }) // add new document

      const savedMutation = await this.mutationService.saveMutation({
        ...mutation,
        source: EntitySourceType.Local,
      })

      return {
        document: savedDocument.toDto(),
        mutation: savedMutation,
      }
    }

    return {
      document: savedDocument.toDto(),
    }
    // }
  }

  private async _editLocalDocumentInMutation(
    mutation: MutationDto,
    dto: DocumentDto
  ): Promise<{ mutation?: MutationDto; document: DocumentDto }> {
    const document = Document.create(dto)
    const loggedInAccountId = await this.nearSigner.getAccountId()

    if (!loggedInAccountId || loggedInAccountId !== document.authorId) {
      // edit document locally, make mutation local(yes?)
      const savedDocument = await this.documentRepository.saveItem(document)

      if (mutation.source === EntitySourceType.Origin) {
        const savedMutation = await this.mutationService.saveMutation({
          ...mutation,
          source: EntitySourceType.Local,
        })

        return {
          document: savedDocument.toDto(),
          mutation: savedMutation,
        }
      }

      return { document: savedDocument.toDto() }
    } else {
      // edit document locally
      const savedDocument = await this.documentRepository.saveItem(document)
      return { document: savedDocument.toDto() }
    }
  }

  private async _editRemoteDocumentInMutation(
    mutation: MutationDto,
    appId: AppId,
    dto: DocumentDto
  ): Promise<{ mutation?: MutationDto; document: DocumentDto }> {
    const loggedInAccountId = await this.nearSigner.getAccountId()
    if (!loggedInAccountId) throw new Error('Not logged in')

    const document = Document.create(dto)

    if (!document.authorId) {
      document.authorId = loggedInAccountId
    }

    if (document.authorId === loggedInAccountId) {
      // edit document remotely
      const savedDocument = await this.documentRepository.saveItem(document)
      return { document: savedDocument.toDto() }
    } else {
      // create document as fork remotely, make mutation local, replace document id with fork id

      const originalDocumentId = dto.id

      const documentFork = await this._constructDocumentWithUniqueId({
        ...dto,
        metadata: {
          ...dto.metadata,
          fork_of: originalDocumentId,
        },
      })

      // ToDo: generate new ID if exists
      const savedDocument = await this.documentRepository.createItem(documentFork)

      // it can be null if mutation was locally edited before
      const editingMutation = this._replaceAppInstance(
        mutation,
        appId,
        originalDocumentId,
        savedDocument.id
      )

      if (editingMutation || mutation.source === EntitySourceType.Origin) {
        const savedMutation = await this.mutationService.saveMutation({
          ...(editingMutation ?? mutation),
          source: EntitySourceType.Local,
        })

        return {
          document: savedDocument.toDto(),
          mutation: savedMutation,
        }
      }

      return {
        document: savedDocument.toDto(),
      }
    }
  }

  private _replaceAppInstance(
    mutation: MutationDto,
    appId: AppId,
    fromDocumentId: DocumentId | null,
    toDocumentId: DocumentId
  ): MutationDto | null {
    const newMutation = { ...mutation }

    const appInstance = newMutation.apps.find(
      (app) => app.appId === appId && app.documentId === fromDocumentId
    )

    if (appInstance) {
      appInstance.documentId = toDocumentId
      return newMutation
    } else {
      return null
    }
  }

  private async _constructDocumentWithUniqueId(dto: DocumentCreateDto): Promise<Document> {
    let documentFork = await this.documentRepository.constructItem(dto)
    let done = false

    while (!done) {
      documentFork = await this.documentRepository.constructItem({
        ...dto,
        metadata: {
          ...dto.metadata,
          name: DocumentSerivce._incrementPostfix(documentFork.metadata.name!),
        },
      })
      done = !(await this.documentRepository.getItem({
        id: documentFork.id,
        source: EntitySourceType.Origin,
      }))
    }

    return documentFork
  }

  /**
   * Increments the postfix number in a string, or adds " (1)" if none exists
   *
   * "asd" => "asd (1)"
   * "asd (1)" => "asd (2)"
   */
  private static _incrementPostfix(str: string): string {
    const regex = /(.*)\s\((\d+)\)$/
    const match = str.match(regex)

    if (match) {
      // If a postfix exists, increment the number
      const baseText = match[1]
      const number = parseInt(match[2], 10)
      return `${baseText} (${number + 1})`
    } else {
      // If no postfix, add " (1)"
      return `${str} (1)`
    }
  }
}
