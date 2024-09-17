import { BaseRepository } from '../base/base.repository'
import { SocialDbService } from '../social-db/social-db.service'
import { ParserConfig } from './parser-config.entity'

export class ParserConfigRepository extends BaseRepository<ParserConfig> {
  constructor(socialDb: SocialDbService) {
    super(ParserConfig, socialDb)
  }
}
