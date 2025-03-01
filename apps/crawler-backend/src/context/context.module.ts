import { Module } from '@nestjs/common';
import { ContextController } from './context.controller';
import { ContextService } from './context.service';
import { ContextNode, ContextEdge } from './entities/context.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ContextNode, ContextEdge])],
  controllers: [ContextController],
  providers: [ContextService],
})
export class ContextModule {}
