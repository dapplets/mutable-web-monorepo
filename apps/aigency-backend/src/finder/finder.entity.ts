import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'finder' })
export class Finder {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column()
  userId!: number;

  @Column({ name: 'is-active', type: 'boolean', default: false })
  isEnabled!: boolean;
}
