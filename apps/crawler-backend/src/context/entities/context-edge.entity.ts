import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'context_edge' })
export class ContextEdge {
  @PrimaryColumn()
  parent: string;

  @PrimaryColumn()
  child: string;
}
