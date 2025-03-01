import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphileWorkerModule } from 'nestjs-graphile-worker';
import { AgentModule } from '../agent/agent.module';
import { ContextNode } from '../context/entities/context-node.entity';
import { ContextEdge } from '../context/entities/context-edge.entity';
import { CRAWLER_DATABASE_URL } from '../env';
import { Job, Order, Step } from '../order/entities/order.entity';
import { OrderModule } from '../order/order.module';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { SchemaModule } from '../schema/schema.module';
import { ContextModule } from '../context/context.module';
import { RunnerModule } from '../runner/runner.module';
import { Job as SchedulerJob } from '../scheduler/entities/job.entity';

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
