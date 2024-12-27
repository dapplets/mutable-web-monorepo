import { WalletSelector } from '@near-wallet-selector/core'
import { getNearConfig } from './config'
import { NearSigner } from './services/near-signer/near-signer.service'
import { SocialDbService } from './services/social-db/social-db.service'
import { IStorage } from './services/local-db/local-storage'
import { LocalDbService } from './services/local-db/local-db.service'
import { LocalStorage } from './services/local-db/local-storage'
import { MutationService } from './services/mutation/mutation.service'
import { ApplicationService } from './services/application/application.service'
import { UserLinkService } from './services/user-link/user-link.service'
import { ParserConfigService } from './services/parser-config/parser-config.service'
import { LinkDbService } from './services/link-db/link-db.service'
import { DocumentSerivce } from './services/document/document.service'
import { UnitOfWorkService } from './services/unit-of-work/unit-of-work.service'
import { NotificationService } from './services/notification/notification.service'
import { SettingsSerivce } from './services/settings/settings.service'
import { BaseRepository } from './services/base/base.repository'
import { Mutation } from './services/mutation/mutation.entity'
import { AppMetadata } from './services/application/application.entity'
import { IndexedLink } from './services/user-link/user-link.entity'
import { ParserConfig } from './services/parser-config/parser-config.entity'
import { Document } from './services/document/document.entity'
import { CtxLink } from './services/link-db/link-db.entity'
import { Notification } from './services/notification/notification.entity'
import { Resolution } from './services/notification/resolution.entity'
import { BaseLocalRepository } from './services/base/base-local.repository'
import { BaseAggRepository } from './services/base/base-agg.repository'
import { ConnectedAccountsService } from './services/connected-accounts/connected-accounts.service'

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
  connectedAccountsService: ConnectedAccountsService

  constructor(public readonly config: EngineConfig) {
    if (!this.config.storage) {
      this.config.storage = new LocalStorage(`mweb:${config.networkId}`)
    }

    const storage = this.config.storage

    this.#selector = this.config.selector
    const nearConfig = getNearConfig(this.config.networkId)

    const localDb = new LocalDbService(storage)
    const nearSigner = new NearSigner(this.#selector, localDb, nearConfig)
    const socialDb = new SocialDbService(nearSigner, nearConfig.contractName)
    const settingsService = new SettingsSerivce(localDb)
    const unitOfWorkService = new UnitOfWorkService(socialDb)

    const mutationRemoteRepository = new BaseRepository(Mutation, socialDb)
    const applicationRemoteRepository = new BaseRepository(AppMetadata, socialDb)
    const userLinkRemoteRepository = new BaseRepository(IndexedLink, socialDb)
    const parserConfigRemoteRepository = new BaseRepository(ParserConfig, socialDb)
    const documentRemoteRepository = new BaseRepository(Document, socialDb)
    const linkDbRemoteRepository = new BaseRepository(CtxLink, socialDb)
    const notificationRemoteRepository = new BaseRepository(Notification, socialDb)
    const resolutionRemoteRepository = new BaseRepository(Resolution, socialDb)

    const mutationLocalRepository = new BaseLocalRepository(Mutation, storage)
    const applicationLocalRepository = new BaseLocalRepository(AppMetadata, storage)
    const userLinkLocalRepository = new BaseLocalRepository(IndexedLink, storage)
    const parserConfigLocalRepository = new BaseLocalRepository(ParserConfig, storage)
    const documentLocalRepository = new BaseLocalRepository(Document, storage)
    const linkDbLocalRepository = new BaseLocalRepository(CtxLink, storage)
    const notificationLocalRepository = new BaseLocalRepository(Notification, storage)
    const resolutionLocalRepository = new BaseLocalRepository(Resolution, storage)

    const mutationRepository = new BaseAggRepository(
      mutationRemoteRepository,
      mutationLocalRepository
    )
    const applicationRepository = new BaseAggRepository(
      applicationRemoteRepository,
      applicationLocalRepository
    )
    const userLinkRepository = new BaseAggRepository(
      userLinkRemoteRepository,
      userLinkLocalRepository
    )
    const parserConfigRepository = new BaseAggRepository(
      parserConfigRemoteRepository,
      parserConfigLocalRepository
    )
    const documentRepository = new BaseAggRepository(
      documentRemoteRepository,
      documentLocalRepository
    )
    const linkDbRepository = new BaseAggRepository(linkDbRemoteRepository, linkDbLocalRepository)
    const notificationRepository = new BaseAggRepository(
      notificationRemoteRepository,
      notificationLocalRepository
    )
    const resolutionRepository = new BaseAggRepository(
      resolutionRemoteRepository,
      resolutionLocalRepository
    )

    this.linkDbService = new LinkDbService(linkDbRepository)
    this.notificationService = new NotificationService(
      notificationRepository,
      resolutionRepository,
      unitOfWorkService,
      nearSigner
    )
    this.mutationService = new MutationService(
      mutationRepository,
      settingsService,
      this.notificationService,
      unitOfWorkService,
      nearConfig,
      nearSigner
    )
    this.applicationService = new ApplicationService(applicationRepository, settingsService)
    this.userLinkService = new UserLinkService(
      userLinkRepository,
      this.applicationService,
      nearSigner
    )
    this.parserConfigService = new ParserConfigService(parserConfigRepository)
    this.documentService = new DocumentSerivce(
      documentRepository,
      this.mutationService,
      unitOfWorkService,
      nearSigner
    )
    this.connectedAccountsService = new ConnectedAccountsService(
      nearSigner,
      nearConfig.connectedAccountsContractAddress
    )
  }
}
