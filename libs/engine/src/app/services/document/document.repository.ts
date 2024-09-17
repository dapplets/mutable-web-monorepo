import { SocialDbService } from '../social-db/social-db.service'
import { Document } from './document.entity'
import { BaseRepository } from '../base/base.repository'

export class DocumentRepository extends BaseRepository<Document> {
  constructor(socialDb: SocialDbService) {
    super(Document, socialDb)
  }
}
