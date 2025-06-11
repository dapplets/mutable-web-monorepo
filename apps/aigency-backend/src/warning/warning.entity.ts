import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'warning' })
export class Warning {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  created_at: Date;

  @Column({ default: false })
  is_deleted: boolean;

  @Column()
  hash: string;
}
