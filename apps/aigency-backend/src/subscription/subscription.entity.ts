import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'subscriptions' })
export class Subscription {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ type: 'varchar', nullable: true })
  username!: string | null;

  @Column({ name: 'userid', type: 'varchar', nullable: true })
  userId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  source!: string | null;

  @Column({ type: 'varchar', nullable: true })
  link!: string | null;

  @Column({ name: 'is-active', type: 'boolean', default: true })
  isEnabled!: boolean;
}
