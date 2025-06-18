import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(User, dataSource.manager);
  }

  async createUserWithTables(user: User) {
    await this.dataSource.transaction(async (manager) => {
      await manager.save(user);

      // create memories table
      await manager.query(
        `CREATE TABLE "personal-data"."${user.username}" (
            id SERIAL PRIMARY KEY,
            data VARCHAR NOT NULL,
            datetime TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`,
      );

      // create message history table
      await manager.query(
        `CREATE TABLE "public"."${user.username}" (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR NOT NULL,
            message JSONB NOT NULL,
            timestamp TIMESTAMP DEFAULT NOW()
        )`,
      );
    });
  }

  async deleteUserWithTables(userId: number) {
    await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOneBy(User, { id: userId });

      if (!user) {
        throw new Error('User not found');
      }

      const { username } = user;

      await manager.query(`DROP TABLE "personal-data".${username}`);
      await manager.query(`DROP TABLE "public".${username}`);
      await manager.query(
        `delete from "default".user_capability uc where uc.username = $1`,
        [username],
      );
      await manager.query(
        `delete from "public".users u where u.username = $1`,
        [username],
      );
    });
  }
}
