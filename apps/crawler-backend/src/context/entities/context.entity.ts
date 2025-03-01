import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'context_node', synchronize: false })
export class ContextNode {
  @Column({ primary: true })
  id: string;

  @Column({ type: 'json' })
  metadata: {
    namespace: string;
    contextType: string;
    id: string;
    hash: string;
  };

  @Column({ type: 'simple-json', name: 'content' })
  content: any;
}

@Entity({ name: 'context_edge' })
export class ContextEdge {
  @PrimaryColumn()
  parent: string;

  @PrimaryColumn()
  child: string;
}
