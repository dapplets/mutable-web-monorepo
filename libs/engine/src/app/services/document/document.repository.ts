import { SocialDbService, Value } from '../social-db/social-db.service'
import { Document } from './document.entity'
import { mergeDeep } from '../../common/merge-deep'
import { BaseRepository } from '../base/base.repository'

// SocialDB
const ProjectIdKey = 'dapplets.near'
const SettingsKey = 'settings'
const DocumentKey = 'document'
const KeyDelimiter = '/'
const EmptyValue = ''

export class DocumentRepository extends BaseRepository<Document> {
  constructor(socialDb: SocialDbService) {
    super(Document, socialDb)
  }

  async saveDocument(document: Omit<Document, 'authorId' | 'localId'>): Promise<Document> {
    const [authorId, , localId] = document.id.split(KeyDelimiter) // ToDo: duplicate in prepareSaveDocument

    const preparedDocument = await this.prepareSaveDocument(document)

    await this.socialDb.set(preparedDocument)

    return {
      ...document,
      localId,
      authorId,
    }
  }

  async prepareSaveDocument(document: Omit<Document, 'authorId' | 'localId'>): Promise<Value> {
    const [authorId, , localId] = document.id.split(KeyDelimiter)

    const keys = [authorId, SettingsKey, ProjectIdKey, DocumentKey, localId]

    const storedAppMetadata = {
      metadata: document.metadata,
      open_with: mergeDeep(
        {},
        ...document.openWith.map((appId) =>
          SocialDbService.buildNestedData(appId.split(KeyDelimiter), EmptyValue)
        )
      ),
    }

    return SocialDbService.buildNestedData(keys, storedAppMetadata)
  }
}
