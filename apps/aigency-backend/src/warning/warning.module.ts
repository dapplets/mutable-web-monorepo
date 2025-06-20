import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warning } from './warning.entity';
import { WarningRepository } from './warning.repository';
import { WarningService } from './warning.service';
import { WarningController } from './warning.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Warning])],
  providers: [WarningRepository, WarningService],
  controllers: [WarningController],
  exports: [WarningService],
})
export class WarningModule {}
