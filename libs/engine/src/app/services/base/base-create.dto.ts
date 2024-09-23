export type BaseCreateDto =
  | {
      authorId: string
      localId: string
    }
  | {
      id: string
    }
