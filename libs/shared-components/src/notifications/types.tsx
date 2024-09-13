export enum NotificationType {
  Regular = 'regular',
  PullRequest = 'pull-request',
}

export enum PullRequestStatus {
  Open = 'open',
  Rejected = 'rejected',
  Accepted = 'accepted',
}

export type RegularPayload = {
  subject: string
  body: string
}

export type PullRequestPayload = {
  commitMessage: string
  commitName: string
  committer: string
  sourceMutationId: string
  targetMutationId: string
  status: PullRequestStatus
}

export type NotificationPayloadMap = {
  [NotificationType.Regular]: RegularPayload
  [NotificationType.PullRequest]: PullRequestPayload
}

export enum NotificationApiType {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

export type GenericNotification =
  | {
      apiType: NotificationApiType
      id: string
      type: NotificationType.Regular
      payload: RegularPayload
      isRead: boolean
      createdAt: string
      createdBy: string
      actions?: {
        label: string
        type?: 'primary' | 'default'
        onClick?: () => void
        icon?: React.JSX.Element
      }[]
    }
  | {
      apiType: NotificationApiType
      id: string
      type: NotificationType.PullRequest
      payload: PullRequestPayload
      isRead: boolean
      createdAt: string
      createdBy: string
      actions?: {
        label: string
        type?: 'primary' | 'default'
        onClick?: () => void
        icon?: React.JSX.Element
      }[]
    }
