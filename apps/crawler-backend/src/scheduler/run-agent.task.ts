import { Inject, Injectable } from '@nestjs/common';
import { Task, TaskHandler } from 'nestjs-graphile-worker';
import { AgentRunnerService } from './agent-runner.service';
import { ContextNode } from 'src/context/entities/context.entity';

@Injectable()
@Task('run-agent')
export class RunAgentTask {
  // private logger = new Logger(RunAgentTask.name);

  constructor(
    @Inject(AgentRunnerService)
    private runnerService: AgentRunnerService,
  ) {}

  @TaskHandler()
  async handler({ image, context }: { image: string; context: ContextNode }) {
    // this.logger.log(
    //   `Schedule job to run agent ${image} for ${context.namespace}:${context.contextType}:${context.id}`,
    // );

    await this.runnerService.execute(image, context);

    // todo: save to db
  }
}
