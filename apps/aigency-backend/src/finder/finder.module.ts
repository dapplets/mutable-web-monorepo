import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Finder } from './finder.entity';
import { FinderRepository } from './finder.repository';
import { FinderService } from './finder.service';
import { FinderController } from './finder.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Finder])],
  providers: [FinderRepository, FinderService],
  controllers: [FinderController],
  exports: [FinderService],
})
export class FinderModule {}
