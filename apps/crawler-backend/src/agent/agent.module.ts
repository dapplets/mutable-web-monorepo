import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
