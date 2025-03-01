import { Module } from '@nestjs/common';
import { AgentModule } from 'src/agent/agent.module';
import { RunnerService } from '../runner/runner.service';
import { ConfigModule } from '@nestjs/config';
import { ContextModule } from 'src/context/context.module';

@Module({
  imports: [AgentModule, ConfigModule, ContextModule],
  controllers: [],
  providers: [RunnerService],
  exports: [],
})
export class RunnerModule {}
