import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'reward_history' })
export class RewardHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'recipient_account_id', type: 'text', nullable: true })
  recipientAccountId!: string | null;

  @Column({ type: 'text' })
  amount!: string;

  @Column({ name: 'tx_hash', type: 'text', nullable: true })
  txHash!: string | null;

  @Column({ name: 'related_item_type', type: 'text' })
  relatedItemType!: string;

  @Column({ name: 'related_item_id', type: 'uuid' })
  relatedItemId!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;
}
