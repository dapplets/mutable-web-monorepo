import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphileWorkerModule } from 'nestjs-graphile-worker';
import { AgentModule } from 'src/agent/agent.module';
import { ContextEdge, ContextNode } from 'src/context/entities/context.entity';
import { CRAWLER_DATABASE_URL } from 'src/env';
import { Job, Order, Step } from 'src/order/entities/order.entity';
import { OrderModule } from 'src/order/order.module';
import { SchedulerModule } from 'src/scheduler/scheduler.module';
import { SchemaModule } from 'src/schema/schema.module';
import { ContextModule } from '../context/context.module';
import { RunnerModule } from 'src/runner/runner.module';
import { Job as SchedulerJob } from 'src/scheduler/entities/job.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ContextModule,
    OrderModule,
    SchedulerModule,
    RunnerModule,
    AgentModule,
    SchemaModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: CRAWLER_DATABASE_URL,
      entities: [Order, Job, Step, ContextNode, ContextEdge, SchedulerJob],
      synchronize: true,
    }),
    GraphileWorkerModule.forRoot({
      connectionString: CRAWLER_DATABASE_URL,
      concurrency: 1,
      logger: null,
    }),
  ],
})
export class AppModule {}
