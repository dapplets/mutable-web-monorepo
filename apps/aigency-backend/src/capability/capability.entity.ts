import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserCapability } from './user-capability.entity';

@Entity({ name: 'capability' })
export class Capability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  domain: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  stars: number;

  @Column({ nullable: true, name: 'token_id' })
  tokenId: string;

  @Column({ nullable: true, name: 'beneficiary_network' })
  beneficiaryNetwork: string;

  @Column({ nullable: true, name: 'beneficiary_account_id' })
  beneficiaryAccountId: string;

  @OneToMany(
    () => UserCapability,
    (userCapability) => userCapability.capability,
  )
  users: UserCapability[];
}
