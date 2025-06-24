import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memory } from './memory.entity';
import { MemoryRepository } from './memory.repository';
import { MemoryService } from './memory.service';
import { MemoryController } from './memory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Memory])],
  providers: [MemoryRepository, MemoryService],
  controllers: [MemoryController],
  exports: [MemoryService],
})
export class MemoryModule {}
