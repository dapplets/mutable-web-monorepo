import { Inject, Injectable } from '@nestjs/common';
import { AgentService } from 'src/agent/agent.service';
import { ContextNode } from 'src/context/entities/context-node.entity';
import { WorkerService } from 'nestjs-graphile-worker';
import { DataSource, Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SchedulerService {
  constructor(
    @Inject(AgentService)
    private agentService: AgentService,

    @Inject(WorkerService)
    private readonly graphileWorker: WorkerService,

    @InjectRepository(Job)
    private jobRepository: Repository<Job>,

    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async processContext(context: ContextNode) {
    const agents = await this.agentService.getAgentsForContext(context);

    // ToDo: make queue
    for (const agent of agents) {
      await this.graphileWorker.addJob(
        'run-agent',
        {
          agentId: agent.id,
          contextId: context.id,
        },
        {
          maxAttempts: 2,
          queueName: agent.id,
        },
      );
    }
  }

  async getJobs() {
    return this.jobRepository.find({
      take: 100,
    });
  }

  async getAgentsQueue() {
    const agents = await this.agentService.getAgents();
    const result = await this.dataSource.query(`
      select
        j.queue_name as agent_id,
        count(j.*) as jobs_count,
        coalesce((
        select
          consumption
        from
          public.agent
        where
          id = j.queue_name),
        0) as consumption
      from
        graphile_worker.jobs as j
      group by
        j.queue_name 
    `);

    return result.map((item) => {
      const agent = agents.find((agent) => agent.id === item.agent_id);
      return {
        id: agent.id,
        metadata: agent.metadata,
        consumption: item.consumption,
        rate: agent.rate,
        total: (agent.rate * item.consumption) / 1000 / 60 / 60,
        jobsCount: Number(item.jobs_count),
      };
    });
  }
}
