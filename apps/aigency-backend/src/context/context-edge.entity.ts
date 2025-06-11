import { Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'context_edge' })
@Index(
  [
    'from_context_namespace',
    'from_context_type',
    'from_context_id',
    'to_context_namespace',
    'to_context_type',
    'to_context_id',
  ],
  { unique: true },
)
export class ContextEdge {
  @PrimaryColumn()
  from_context_namespace: string;

  @PrimaryColumn()
  from_context_type: string;

  @PrimaryColumn()
  from_context_id: string;

  @PrimaryColumn()
  to_context_namespace: string;

  @PrimaryColumn()
  to_context_type: string;

  @PrimaryColumn()
  to_context_id: string;
}
