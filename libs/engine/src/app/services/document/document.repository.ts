import { AppId } from '../application/application.entity'
import { SocialDbService } from '../social-db/social-db.service'
import { Document, DocumentId } from './document.entity'
import { mergeDeep } from '../../common/merge-deep'

// SocialDB
const ProjectIdKey = 'dapplets.near'
const SettingsKey = 'settings'
const AppKey = 'app'
const DocumentKey = 'document'
const OpenWithKey = 'open_with'
const WildcardKey = '*'
const RecursiveWildcardKey = '**'
const KeyDelimiter = '/'
const EmptyValue = ''

export class DocumentRepository {
  constructor(private socialDb: SocialDbService) {}

  async getDocument(globalDocumentId: DocumentId): Promise<Document | null> {
    const [authorId, , documentLocalId] = globalDocumentId.split(KeyDelimiter)

    const keys = [authorId, SettingsKey, ProjectIdKey, DocumentKey, documentLocalId]
    const queryResult = await this.socialDb.get([
      [...keys, RecursiveWildcardKey].join(KeyDelimiter),
    ])

    const document = SocialDbService.getValueByKey(keys, queryResult)

    if (!document) return null

    const compatibleApps = SocialDbService.splitObjectByDepth(document.open_with, 3)

    return {
      metadata: document.metadata,
      id: globalDocumentId,
      openWith: Object.keys(compatibleApps),
      authorId,
      documentLocalId,
    }
  }

  async getDocumentsByAppId(globalAppId: AppId): Promise<Document[]> {
    const [appAuthorId, , appLocalId] = globalAppId.split(KeyDelimiter)

    const keys = [
      WildcardKey, // any author id
      SettingsKey,
      ProjectIdKey,
      DocumentKey,
      WildcardKey, // any document local id
      OpenWithKey,
      appAuthorId,
      AppKey,
      appLocalId,
    ]

    const foundKeys = await this.socialDb.keys([keys.join(KeyDelimiter)])

    const documentIds = foundKeys.map((key: string) => {
      const [authorId, , , , documentLocalId] = key.split(KeyDelimiter)
      return [authorId, DocumentKey, documentLocalId].join(KeyDelimiter)
    })

    const documents = await Promise.all(documentIds.map((id) => this.getDocument(id))).then(
      (documents) => documents.filter((x) => x !== null)
    )

    return documents
  }

  async saveDocument(
    document: Omit<Document, 'authorId' | 'documentLocalId'>
  ): Promise<Document> {
    const [authorId, , documentLocalId] = document.id.split(KeyDelimiter)

    const keys = [authorId, SettingsKey, ProjectIdKey, DocumentKey, documentLocalId]

    const storedAppMetadata = {
      metadata: document.metadata,
      open_with: mergeDeep(
        {},
        ...document.openWith.map((appId) =>
          SocialDbService.buildNestedData(appId.split(KeyDelimiter), EmptyValue)
        )
      ),
    }

    await this.socialDb.set(SocialDbService.buildNestedData(keys, storedAppMetadata))

    return {
      ...document,
      documentLocalId,
      authorId,
    }
  }
}
