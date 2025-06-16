import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  getUserById(id: number) {
    return this.userRepository.findOneBy({ id }).then((user) => user?.toDto());
  }
}
