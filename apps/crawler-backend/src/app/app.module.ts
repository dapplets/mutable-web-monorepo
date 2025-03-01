import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ContextModule,
    OrderModule,
    SchedulerModule,
    AgentModule,
    SchemaModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: CRAWLER_DATABASE_URL,
      entities: [Order, Job, Step, ContextNode, ContextEdge],
      synchronize: true,
    }),
    GraphileWorkerModule.forRoot({
      connectionString: CRAWLER_DATABASE_URL,
      concurrency: 3,
      logger: null,
    }),
  ],
})
export class AppModule {}
