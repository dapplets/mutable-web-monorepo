import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'context_edge' })
export class ContextEdge {
  @PrimaryColumn()
  source: string;

  @PrimaryColumn()
  target: string;

  @PrimaryColumn()
  namespace: string;

  @PrimaryColumn()
  type: string;
}
