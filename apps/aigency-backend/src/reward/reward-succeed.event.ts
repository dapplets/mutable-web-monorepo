export class RewardSucceedEvent {
  constructor(
    public readonly beneficiaryAccountId: string,
    public readonly txHash: string,
    public readonly callerUsername: string,
  ) {}
}
