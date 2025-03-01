import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { AgentRunnerService } from './agent-runner.service';
import { AgentModule } from 'src/agent/agent.module';
// import { ContextModule } from 'src/context/context.module';

@Module({
  imports: [AgentModule],
  controllers: [],
  providers: [SchedulerService, AgentRunnerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
