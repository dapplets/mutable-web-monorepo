import { Capability } from 'src/capability/capability.entity';
import { Reward } from 'src/reward/reward.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'usage_history' })
export class Usage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', name: 'caller_username' })
  callerUsername!: string;

  @Column({ name: 'capability_id', type: 'uuid' })
  capabilityId!: string;

  @Column({ type: 'text', name: 'execution_input', nullable: true })
  executionInput!: string | null;

  @Column({ type: 'text', name: 'execution_output', nullable: true })
  executionOutput!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;

  @OneToOne(() => Reward, (reward) => reward.usage)
  reward!: Reward;
}
