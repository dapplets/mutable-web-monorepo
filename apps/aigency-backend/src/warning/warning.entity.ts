import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'warning' })
export class Warning {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  username!: string;

  @Column({ type: 'text', nullable: true })
  title!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;

  @Column({ name: 'is_deleted', type: 'bool', default: false })
  isDeleted!: boolean;

  @Column({ type: 'text' })
  hash!: string;

  toDto() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      createdAt: this.createdAt,
    };
  }
}
