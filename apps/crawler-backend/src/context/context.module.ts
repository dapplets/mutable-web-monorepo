import { Module } from '@nestjs/common';
import { ContextController } from './context.controller';
import { ContextService } from './context.service';
import { ContextNode, ContextEdge } from './entities/context.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerModule } from 'src/scheduler/scheduler.module';
import { IndexerService } from './indexer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContextNode, ContextEdge]),
    SchedulerModule, // ToDo: circular dep
  ],
  controllers: [ContextController],
  providers: [ContextService, IndexerService],
  exports: [ContextService],
})
export class ContextModule {}
