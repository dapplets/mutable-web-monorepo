import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'context_node' })
export class ContextNode {
  @Column({ primary: true })
  hash: string;

  @Column()
  namespace: string;

  @Column({ name: 'type' })
  contextType: string;

  @Column()
  id: string;

  @Column({ type: 'json', name: 'parsed' })
  parsedContext: any;
}

@Entity({ name: 'context_edge' })
export class ContextEdge {
  @PrimaryColumn()
  parent: string;

  @PrimaryColumn()
  child: string;
}
