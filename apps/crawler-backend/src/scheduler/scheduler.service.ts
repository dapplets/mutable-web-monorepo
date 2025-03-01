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

  async processContext(context: ContextNode) {
    const agents = await this.agentService.getAgentsForContext(context);

    // ToDo: make queue
    for (const agent of agents) {
      await this.graphileWorker.addJob('run-agent', {
        agentId: agent.id,
        contextId: context.id,
      });
    }
  }
}
