import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Agent {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'float' })
  consumption: number;
}
