import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContextNode } from './context-node.entity';
import { ContextEdge } from './context-edge.entity';
import { ContextNodeRepository } from './context-node.repository';
import { ContextEdgeRepository } from './context-edge.repository';
import { ContextService } from './context.service';
import { ContextController } from './context.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContextNode]),
    TypeOrmModule.forFeature([ContextEdge]),
  ],
  providers: [ContextEdgeRepository, ContextNodeRepository, ContextService],
  controllers: [ContextController],
  exports: [ContextService],
})
export class ContextModule {}
