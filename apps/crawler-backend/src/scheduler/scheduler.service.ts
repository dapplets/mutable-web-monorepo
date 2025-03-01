import { Inject, Injectable } from '@nestjs/common';
import { AgentService } from 'src/agent/agent.service';
import { AgentRunnerService } from './agent-runner.service';
import { ContextNode } from 'src/context/entities/context.entity';
// import { ContextService } from 'src/context/context.service';

@Injectable()
export class SchedulerService {
  constructor(
    @Inject(AgentService)
    private agentService: AgentService,

    @Inject(AgentRunnerService)
    private runnerService: AgentRunnerService,

    // @Inject(ContextService)
    // private contextService: ContextService,
  ) {}

  async processContext(context: ContextNode) {
    // ToDo: add schema to context
    if (context.contextType === 'post') {
      const agents = await this.agentService.getAgentsByInputSchema(
        'dapplets.near/schema/post',
      );

      // ToDo: make queue
      for (const agent of agents) {
        await this._processContextWithAgent(agent.image, context);
      }
    }
  }

  async _processContextWithAgent(image: string, context: ContextNode) {
    const resultContext = await this.runnerService.execute(image, context);
    console.log({ resultContext });
    // ToDo: save to db
    // await this.contextService.storeContext(resultContext);
  }
}
