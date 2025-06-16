import { Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'context_edge' })
@Index(
  [
    'fromContextNamespace',
    'fromContextType',
    'fromContextId',
    'toContextNamespace',
    'toContextType',
    'toContextId',
  ],
  { unique: true },
)
export class ContextEdge {
  @PrimaryColumn({ name: 'from_context_namespace' })
  fromContextNamespace!: string;

  @PrimaryColumn({ name: 'from_context_type' })
  fromContextType!: string;

  @PrimaryColumn({ name: 'from_context_id' })
  fromContextId!: string;

  @PrimaryColumn({ name: 'to_context_namespace' })
  toContextNamespace!: string;

  @PrimaryColumn({ name: 'to_context_type' })
  toContextType!: string;

  @PrimaryColumn({ name: 'to_context_id' })
  toContextId!: string;
}
