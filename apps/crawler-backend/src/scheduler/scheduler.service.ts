import { Inject, Injectable } from '@nestjs/common';
import { AgentService } from 'src/agent/agent.service';
import { ContextNode } from 'src/context/entities/context.entity';
import { WorkerService } from 'nestjs-graphile-worker';

@Injectable()
export class SchedulerService {
  constructor(
    @Inject(AgentService)
    private agentService: AgentService,

    @Inject(WorkerService)
    private readonly graphileWorker: WorkerService,
  ) {}

  private async _addRunAgentJob(image: string, context: ContextNode) {
    await this.graphileWorker.addJob('run-agent', { image, context });
  }

  async processContext(context: ContextNode) {
    // ToDo: add schema to context
    if (context.contextType === 'post') {
      const agents = await this.agentService.getAgentsByInputSchema(
        'dapplets.near/schema/post',
      );

      // ToDo: make queue
      for (const agent of agents) {
        await this._addRunAgentJob(agent.image, context);
      }
    }
  }
}
