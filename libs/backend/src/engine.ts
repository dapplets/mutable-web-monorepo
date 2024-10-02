import { WalletSelector } from '@near-wallet-selector/core'
import { getNearConfig } from './config'
import { NearSigner } from './services/near-signer/near-signer.service'
import { SocialDbService } from './services/social-db/social-db.service'
import { IStorage } from './services/local-db/local-storage'
import { LocalDbService } from './services/local-db/local-db.service'
import { LocalStorage } from './services/local-db/local-storage'
import { MutationRepository } from './services/mutation/mutation.repository'
import { ApplicationRepository } from './services/application/application.repository'
import { UserLinkRepository } from './services/user-link/user-link.repository'
import { ParserConfigRepository } from './services/parser-config/parser-config.repository'
import { DocumentRepository } from './services/document/document.repository'
import { NotificationRepository } from './services/notification/notification.repository'
import { MutationService } from './services/mutation/mutation.service'
import { ApplicationService } from './services/application/application.service'
import { UserLinkService } from './services/user-link/user-link.service'
import { ParserConfigService } from './services/parser-config/parser-config.service'
import { LinkDbService } from './services/link-db/link-db.service'
import { DocumentSerivce } from './services/document/document.service'
import { LinkDbRepository } from './services/link-db/link-db.repository'
import { UnitOfWorkService } from './services/unit-of-work/unit-of-work.service'
import { NotificationService } from './services/notification/notification.service'
import { ResolutionRepository } from './services/notification/resolution.repository'

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
  notificationService: NotificationService
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
    const notificationRepository = new NotificationRepository(socialDb)
    const resolutionRepository = new ResolutionRepository(socialDb)

    this.linkDbService = new LinkDbService(linkDbRepository)
    this.notificationService = new NotificationService(
      notificationRepository,
      resolutionRepository,
      unitOfWorkService,
      nearSigner
    )
    this.mutationService = new MutationService(
      mutationRepository,
      this.notificationService,
      unitOfWorkService,
      nearConfig
    )
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
