import { Column, Entity } from 'typeorm';

// ToDo: table is created by langchain
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
