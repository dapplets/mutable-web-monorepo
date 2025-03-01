import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { AgentModule } from 'src/agent/agent.module';
import { ConfigModule } from '@nestjs/config';
import { SchedulerController } from './scheduler.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';

@Module({
  imports: [AgentModule, ConfigModule, TypeOrmModule.forFeature([Job])],
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
