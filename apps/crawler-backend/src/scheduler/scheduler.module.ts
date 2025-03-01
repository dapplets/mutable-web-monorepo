import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { AgentModule } from 'src/agent/agent.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AgentModule, ConfigModule],
  controllers: [],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
