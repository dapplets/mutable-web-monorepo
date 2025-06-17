import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usage } from './usage.entity';
import { UsageRepository } from './usage.repository';
import { UsageService } from './usage.service';
import { UsageController } from './usage.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usage])],
  providers: [UsageRepository, UsageService],
  controllers: [UsageController],
})
export class UsageModule {}
