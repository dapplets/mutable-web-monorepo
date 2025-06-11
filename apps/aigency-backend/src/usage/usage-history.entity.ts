import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'usage_history' })
export class UsageHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  caller_username: string;

  @Column({ type: 'uuid' })
  capability_id: string;

  @Column({ nullable: true })
  execution_input: string;

  @Column({ nullable: true })
  execution_output: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  created_at: Date;
}
