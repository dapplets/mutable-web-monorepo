export enum PullRequestStatus {
  Open = 'open',
  Rejected = 'rejected',
  Accepted = 'accepted',
}

export type PullRequestPayload = {
  sourceMutationId: string // nikter.near/mutation/Sandbox
  targetMutationId: string // dapplets.near/mutation/Sandbox
}

export type PullRequestResult = {
  status: PullRequestStatus
}
