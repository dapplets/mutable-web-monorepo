import { Inject, Injectable } from '@nestjs/common';
import { AgentService } from 'src/agent/agent.service';
import { ContextNode } from 'src/context/entities/context-node.entity';
import { WorkerService } from 'nestjs-graphile-worker';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SchedulerService {
  constructor(
    @Inject(AgentService)
    private agentService: AgentService,

    @Inject(WorkerService)
    private readonly graphileWorker: WorkerService,

    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
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

  async getJobs() {
    return this.jobRepository.find({
      take: 100,
    });
  }
}
