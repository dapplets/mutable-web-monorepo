import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Memory {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ type: 'text', nullable: true })
  data!: string | null;

  @Column({ name: 'datetime', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;

  toDto() {
    return {
      id: this.id,
      data: this.data,
      createdAt: this.createdAt,
    };
  }
}
