import { AppId } from '../application/application.entity'
import { Document, DocumentId } from './document.entity'
import { DocumentRepository } from './document.repository'

export class DocumentSerivce {
  constructor(private documentRepository: DocumentRepository) {}

  async getDocument(globalDocumentId: DocumentId): Promise<Document | null> {
    return this.documentRepository.getDocument(globalDocumentId)
  }

  async getDocumentsByAppId(globalAppId: AppId): Promise<Document[]> {
    return this.documentRepository.getDocumentsByAppId(globalAppId)
  }

  async createDocument(
    document: Omit<Document, 'authorId' | 'documentLocalId'>
  ): Promise<Document> {
    if (await this.documentRepository.getDocument(document.id)) {
      throw new Error('Document with that ID already exists')
    }

    return this.documentRepository.saveDocument(document)
  }

  async editMutation(document: Omit<Document, 'authorId' | 'documentLocalId'>): Promise<Document> {
    return this.documentRepository.saveDocument(document)
  }
}
