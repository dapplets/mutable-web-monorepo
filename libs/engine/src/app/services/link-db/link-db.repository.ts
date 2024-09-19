import { SocialDbService } from '../social-db/social-db.service'
import { BaseRepository } from '../base/base.repository'
import { CtxLink } from './link-db.entity'

export class LinkDbRepository extends BaseRepository<CtxLink> {
  constructor(socialDb: SocialDbService) {
    super(CtxLink, socialDb)
  }
}
