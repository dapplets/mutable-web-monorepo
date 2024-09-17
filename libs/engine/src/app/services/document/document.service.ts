import { TransferableContext } from '../../common/transferable-context'
import { AppId } from '../application/application.entity'
import { LinkedDataByAccount } from '../link-db/link-db.entity'
import { LinkDbService } from '../link-db/link-db.service'
import { MutationId } from '../mutation/mutation.entity'
import { MutationService } from '../mutation/mutation.service'
import { SocialDbService, Value } from '../social-db/social-db.service'
import { Document, DocumentId } from './document.entity'
import { DocumentRepository } from './document.repository'

export class DocumentSerivce {
  constructor(
    private documentRepository: DocumentRepository,
    private linkDbService: LinkDbService,
    private mutationService: MutationService,
    private socialDbService: SocialDbService
  ) {}

  async getDocument(globalDocumentId: DocumentId): Promise<Document | null> {
    return this.documentRepository.getItem(globalDocumentId)
  }

  async getDocumentsByAppId(globalAppId: AppId): Promise<Document[]> {
    return this.documentRepository.getItemsByIndex({ openWith: [globalAppId] })
  }

  async createDocument(document: Omit<Document, 'authorId' | 'localId'>): Promise<Document> {
    if (await this.documentRepository.getItem(document.id)) {
      throw new Error('Document with that ID already exists')
    }

    return this.documentRepository.saveDocument(document)
  }

  async editMutation(document: Omit<Document, 'authorId' | 'localId'>): Promise<Document> {
    return this.documentRepository.saveDocument(document)
  }

  async createDocumentWithData(
    mutationId: MutationId,
    appId: AppId,
    document: Omit<Document, 'authorId' | 'localId'>,
    ctx: TransferableContext,
    dataByAccount: LinkedDataByAccount
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

    const dataToCommit = await Promise.all([
      this.documentRepository.prepareSaveDocument(document),
      this.mutationService.prepareSaveMutation(mutation),
      this.linkDbService.prepareSet(mutationId, appId, document.id, ctx, dataByAccount),
    ])

    await this.socialDbService.setMultiple(dataToCommit)

    return { mutation }
  }
}
