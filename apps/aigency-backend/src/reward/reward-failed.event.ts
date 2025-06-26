export class RewardFailedEvent {
  constructor(
    public readonly beneficiaryAccountId: string,
    public readonly callerUserId: number,
  ) {}
}
