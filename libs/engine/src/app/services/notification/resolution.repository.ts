import { BaseRepository } from '../base/base.repository'
import { SocialDbService } from '../social-db/social-db.service'
import { Resolution } from './resolution.entity'

export class ResolutionRepository extends BaseRepository<Resolution> {
  constructor(socialDb: SocialDbService) {
    super(Resolution, socialDb)
  }
}
