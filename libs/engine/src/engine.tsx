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
import { DocumentRepository } from './app/services/document/document.repository'
import { MutationService } from './app/services/mutation/mutation.service'
import { ApplicationService } from './app/services/application/application.service'
import { UserLinkService } from './app/services/user-link/user-link.service'
import { ParserConfigService } from './app/services/parser-config/parser-config.service'
import { LinkDbService } from './app/services/link-db/link-db.service'
import { DocumentSerivce } from './app/services/document/document.service'
import { LinkDbRepository } from './app/services/link-db/link-db.repository'
import { UnitOfWorkService } from './app/services/unit-of-work/unit-of-work.service'

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

  linkDbService: LinkDbService
  mutationService: MutationService
  applicationService: ApplicationService
  userLinkService: UserLinkService
  parserConfigService: ParserConfigService
  documentService: DocumentSerivce

  constructor(public readonly config: EngineConfig) {
    if (!this.config.storage) {
      this.config.storage = new LocalStorage('mutable-web-engine')
    }

    this.#selector = this.config.selector
    const nearConfig = getNearConfig(this.config.networkId)

    const localDb = new LocalDbService(this.config.storage)
    const nearSigner = new NearSigner(this.#selector, localDb, nearConfig)
    const socialDb = new SocialDbService(nearSigner, nearConfig.contractName)
    const unitOfWorkService = new UnitOfWorkService(socialDb)
    const mutationRepository = new MutationRepository(socialDb, localDb)
    const applicationRepository = new ApplicationRepository(socialDb, localDb)
    const userLinkRepository = new UserLinkRepository(socialDb)
    const parserConfigRepository = new ParserConfigRepository(socialDb)
    const documentRepository = new DocumentRepository(socialDb)
    const linkDbRepository = new LinkDbRepository(socialDb)

    this.linkDbService = new LinkDbService(linkDbRepository)
    this.mutationService = new MutationService(mutationRepository, unitOfWorkService, nearConfig)
    this.applicationService = new ApplicationService(applicationRepository)
    this.userLinkService = new UserLinkService(
      userLinkRepository,
      this.applicationService,
      nearSigner
    )
    this.parserConfigService = new ParserConfigService(parserConfigRepository)
    this.documentService = new DocumentSerivce(
      documentRepository,
      this.linkDbService,
      this.mutationService,
      unitOfWorkService
    )
  }
}
