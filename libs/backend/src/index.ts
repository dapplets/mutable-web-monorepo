export { Engine } from './engine'
export { EntityId, EntitySourceType } from './services/base/base.entity'
export { MutationWithSettings, AppInMutation } from './services/mutation/mutation.entity'
export { MutationDto } from './services/mutation/dtos/mutation.dto'
export { SaveMutationOptions } from './services/mutation/mutation.service'
export { MutationCreateDto } from './services/mutation/dtos/mutation-create.dto'
export {
  AppWithSettings,
  AppInstanceWithSettings,
  AppId,
} from './services/application/application.entity'
export { ApplicationDto } from './services/application/dtos/application.dto'
export { ApplicationCreateDto } from './services/application/dtos/application-create.dto'
export { LocalStorage } from './services/local-db/local-storage'
export { IStorage } from './services/local-db/local-storage'
export { EngineConfig } from './engine'
export { DocumentDto } from './services/document/dtos/document.dto'
export { DocumentCreateDto } from './services/document/dtos/document-create.dto'
export { DocumentCommitDto } from './services/document/dtos/document-commit.dto'
export { DocumentId, DocumentMetadata } from './services/document/document.entity'
export { NotificationType } from './services/notification/notification.entity'
export { NotificationDto } from './services/notification/dtos/notification.dto'
export { TransferableContext } from './types/transferable-context'
export { Target } from './services/target/target.entity'
export { LinkedDataByAccountDto, LinkIndexRules } from './services/link-db/link-db.entity'
export { BuiltInLayoutManagers, getNearConfig, NearConfig } from './config'
export {
  BosUserLinkWithInstance,
  ControllerLink,
  UserLinkId,
} from './services/user-link/user-link.entity'
export { BaseDto } from './services/base/base.dto'
export {
  PullRequestPayload,
  PullRequestResult,
  PullRequestStatus,
} from './services/notification/types/pull-request'
export { PullRequestAcceptedPayload } from './services/notification/types/pull-request-accepted'
export { PullRequestRejectedPayload } from './services/notification/types/pull-request-rejected'
export { RegularPayload } from './services/notification/types/regular'
export {
  TConnectedAccount,
  IConnectedAccountsPair,
  ConnectedAccountsPairStatus,
  IConnectedAccountUser,
  WalletDescriptorWithCAMainStatus,
  NearNetworks,
  ChainTypes,
  TConnectedAccountsVerificationRequestInfo,
  ConnectedAccountsRequestStatus,
} from './services/connected-accounts/types'
export { ConnectedAccountsService } from './services/connected-accounts/connected-accounts.service'

// ToDo: replace with DTO
export { ParserConfig } from './services/parser-config/parser-config.entity'

// ToDo: move getRedirectMap to services
export { BosRedirectMap, getRedirectMap } from './services/dev-server-service'

import { ApplicationService } from './services/application/application.service'
import { TargetService } from './services/target/target.service'

export { InMemoryStorage } from './services/local-db/in-memory-storage'

export const utils = {
  isTargetMet: TargetService.isTargetMet.bind(TargetService),
  getRootContext: TargetService.getRootContext.bind(TargetService),
  findContextByTarget: TargetService.findContextByTarget.bind(TargetService),
  constructAppInstanceId: ApplicationService.constructAppInstanceId.bind(TargetService),
}
