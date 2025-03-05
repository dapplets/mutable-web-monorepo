import { MWebAgent } from 'src/agent/agent.service';
import { ContextNode } from 'src/context/entities/context-node.entity';

export interface IRunnerService {
  run({ agent, context }: { agent: MWebAgent; context: ContextNode }): Promise<any>; // ToDo: unify context node
}
