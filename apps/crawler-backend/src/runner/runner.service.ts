import { Injectable } from '@nestjs/common';
import { Task, TaskHandler } from 'nestjs-graphile-worker';
import { Logger } from '@nestjs/common';
import { AgentService } from 'src/agent/agent.service';
import { ContextService } from 'src/context/context.service';
import { RunnerServiceFactory } from './runner-service.factory';

@Injectable()
@Task('run-agent')
export class RunnerService {
  private logger = new Logger(RunnerService.name);

  constructor(
    private readonly runnerServiceFactory: RunnerServiceFactory,
    private agentService: AgentService,
    private contextService: ContextService,
  ) {}

  @TaskHandler()
  async handler({
    agentId,
    contextId,
  }: {
    agentId: string;
    contextId: string;
  }) {
    const agent = await this.agentService.getAgentById(agentId);

    if (!agent) {
      this.logger.error(`Agent ${agentId} not found`);
      return;
    }

    const context = await this.contextService.getContextNodeById(contextId);

    if (!context) {
      this.logger.error(`Context ${contextId} not found`);
      return;
    }

    const runner = this.runnerServiceFactory.getRunner(agent.type);

    if (!runner) {
      this.logger.error(`Agent runner ${agent.type} not found`);
      return;
    }

    try {
      const result = await runner.run({ agent, context });

      if (!result?.context) {
        this.logger.error(`Agent ${agent.id}: no context returned`);
        return;
      }

      const savedContext = await this.contextService.saveContextNode(
        result.context,
      );

      await this.contextService.saveEdge({
        source: context.metadata.hash,
        target: savedContext.metadata.hash,
        namespace: agentId,
        type: 'reply',
      });

      this.logger.debug(`Agent ${agent.id} executed successfully`);

      // return response;
    } catch (errorResponse) {
      this.logger.error(`Agent running error: ${errorResponse}`);
    }
  }
}
