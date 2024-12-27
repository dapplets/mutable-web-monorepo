export type StoreContextResponseDto = {
  receipt: {
    data_hash: string
    amount: string
    receiver_id: string
  }
  signature: string
  public_key: string
}
