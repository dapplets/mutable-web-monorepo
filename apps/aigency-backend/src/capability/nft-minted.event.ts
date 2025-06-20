export class NftMintedEvent {
  constructor(
    public readonly contractId: string,
    public readonly tokenId: string,
    public readonly callerUsername: string,
  ) {}
}
