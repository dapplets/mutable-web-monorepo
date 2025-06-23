export class UserDeletedEvent {
  constructor(
    public readonly userId: number,
    public readonly username: string,
  ) {}
}
