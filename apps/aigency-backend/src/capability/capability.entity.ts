import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserCapability } from './user-capability.entity';

@Entity({ name: 'capability' })
export class Capability {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  domain!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  title!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true, name: 'token_id' })
  tokenId!: string | null;

  @Column({ type: 'text', nullable: true, name: 'beneficiary_network' })
  beneficiaryNetwork!: string | null;

  @Column({ type: 'text', nullable: true, name: 'beneficiary_account_id' })
  beneficiaryAccountId!: string | null;

  @Column({ default: 0 })
  stars!: number;

  @OneToMany(
    () => UserCapability,
    (userCapability) => userCapability.capability,
  )
  users!: UserCapability[];
}
