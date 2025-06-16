import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'context_node' })
@Index(['namespace', 'type', 'id'], { unique: true })
export class ContextNode {
  @PrimaryColumn()
  namespace!: string;

  @PrimaryColumn()
  type!: string;

  @PrimaryColumn()
  id!: string;

  @Column({ type: 'simple-json', nullable: true })
  content!: any;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  timestamp!: Date;
}
