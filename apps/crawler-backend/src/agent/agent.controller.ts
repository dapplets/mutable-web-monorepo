import { Controller, Get, Param } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get()
  async getContexts() {
    return this.agentService.getAgents();
  }

  @Get(':id(*)')
  async getContext(@Param('id') id: string) {
    return this.agentService.getAgentById(id);
  }
}
