import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'reward_history' })
export class RewardHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  recipient_account_id: string;

  @Column()
  amount: string;

  @Column({ nullable: true })
  tx_hash: string;

  @Column()
  related_item_type: string;

  @Column({ type: 'uuid' })
  related_item_id: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  created_at: Date;
}
