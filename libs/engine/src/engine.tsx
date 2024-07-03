import { WalletSelector } from '@near-wallet-selector/core'
import { getNearConfig } from './constants'
import { NearSigner } from './app/services/near-signer/near-signer.service'
import { SocialDbService } from './app/services/social-db/social-db.service'
import { IStorage } from './app/services/local-db/local-storage'
import { LocalDbService } from './app/services/local-db/local-db.service'
import { LocalStorage } from './app/services/local-db/local-storage'
import { MutationRepository } from './app/services/mutation/mutation.repository'
import { ApplicationRepository } from './app/services/application/application.repository'
import { UserLinkRepository } from './app/services/user-link/user-link.repository'
import { ParserConfigRepository } from './app/services/parser-config/parser-config.repository'
import { MutationService } from './app/services/mutation/mutation.service'
import { ApplicationService } from './app/services/application/application.service'
import { UserLinkSerivce } from './app/services/user-link/user-link.service'
import { ParserConfigService } from './app/services/parser-config/parser-config.service'

export type EngineConfig = {
  networkId: string
  gatewayId: string
  selector: WalletSelector
  storage?: IStorage
  bosElementName?: string
  bosElementStyleSrc?: string
}

export class Engine {
  #selector: WalletSelector

  mutationService: MutationService
  applicationService: ApplicationService
  userLinkService: UserLinkSerivce
  parserConfigService: ParserConfigService

  constructor(public readonly config: EngineConfig) {
    if (!this.config.storage) {
      this.config.storage = new LocalStorage('mutable-web-engine')
    }

    this.#selector = this.config.selector
    const nearConfig = getNearConfig(this.config.networkId)
    const localDb = new LocalDbService(this.config.storage)
    const nearSigner = new NearSigner(this.#selector, localDb, nearConfig)
    const socialDb = new SocialDbService(nearSigner, nearConfig.contractName)
    const mutationRepository = new MutationRepository(socialDb, localDb)
    const applicationRepository = new ApplicationRepository(socialDb, localDb)
    const userLinkRepository = new UserLinkRepository(socialDb, nearSigner)
    const parserConfigRepository = new ParserConfigRepository(socialDb)
    this.mutationService = new MutationService(mutationRepository, nearConfig)
    this.applicationService = new ApplicationService(applicationRepository)
    this.userLinkService = new UserLinkSerivce(userLinkRepository, this.applicationService)
    this.parserConfigService = new ParserConfigService(parserConfigRepository)
  }
}
