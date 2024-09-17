import { Cacheable } from 'caching-decorator'
import { SocialDbService } from '../social-db/social-db.service'
import { IndexedLink } from './user-link.entity'
import { BaseRepository } from '../base/base.repository'

export class UserLinkRepository extends BaseRepository<IndexedLink> {
  constructor(socialDb: SocialDbService) {
    super(IndexedLink, socialDb)
  }

  @Cacheable({ ttl: 60000 })
  async getItemsByIndex(entity: Partial<IndexedLink>): Promise<IndexedLink[]> {
    return super.getItemsByIndex(entity)
  }
}
