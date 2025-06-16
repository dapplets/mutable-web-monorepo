import { Entity, PrimaryGeneratedColumn, Column, Check } from 'typeorm';

@Entity({ name: 'users', schema: 'public' })
@Check(`"username" ~ '^[a-z0-9]+$'`)
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 32, nullable: false })
  username!: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  status!: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'near_account_id' })
  nearAccountId!: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'private_key' })
  privateKey!: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'network_id' })
  networkId!: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'nearai_token' })
  nearAiToken!: string | null;

  @Column({ type: 'boolean', default: false, name: 'isdeveloper' })
  isDeveloper!: boolean;

  toDto() {
    return {
      id: this.id,
      username: this.username,
      nearAccountId: this.nearAccountId,
      isDeveloper: this.isDeveloper,
    };
  }
}
