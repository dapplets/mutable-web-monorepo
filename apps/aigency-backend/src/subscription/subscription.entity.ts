import { Column, Entity, Unique, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'subscriptions' })
@Unique('UQ_subscriptions_user_source_link', ['userId', 'source', 'link'])
export class Subscription {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column()
  userId!: number;

  @Column({ type: 'varchar' })
  source!: string;

  @Column({ type: 'varchar' })
  link!: string;

  @Column({ name: 'is-active', type: 'boolean', default: true })
  isEnabled!: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'last_seen_post_timestamp',
  })
  lastSeenPostTimestamp!: Date | null;

  @Column({
    name: 'is_by_finder',
    type: 'boolean',
    default: false,
    nullable: true,
  })
  isByFinder!: boolean | null;

  @Column({
    type: 'numeric',
    array: true,
    default: () => "'{}'::numeric[]",
    nullable: true,
  })
  evaluations!: string[] | null;
}
