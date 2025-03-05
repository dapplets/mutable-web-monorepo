import { Controller, Get } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get('jobs')
  async getJobs() {
    return this.schedulerService.getJobs();
  }

  @Get('runners')
  async getAgentsQueue() {
    return this.schedulerService.getAgentsQueue();
  }
}
