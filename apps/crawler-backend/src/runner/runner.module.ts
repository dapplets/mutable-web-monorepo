import { Module } from '@nestjs/common';
import { AgentModule } from 'src/agent/agent.module';
import { RunnerService } from '../runner/runner.service';
import { ConfigModule } from '@nestjs/config';
import { ContextModule } from 'src/context/context.module';
import { NearAiService } from './nearai.service';
import { OpenFaasService } from './openfaas.service';
import { RunnerServiceFactory } from './runner-service.factory';

@Module({
  imports: [AgentModule, ConfigModule, ContextModule],
  controllers: [],
  providers: [
    RunnerService,
    RunnerServiceFactory,
    NearAiService,
    OpenFaasService,
  ],
  exports: [],
})
export class RunnerModule {}
