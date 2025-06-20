import { Module } from '@nestjs/common';
import { NearService } from './near.service';

@Module({
  imports: [],
  providers: [NearService],
  controllers: [],
  exports: [NearService],
})
export class NearModule {}
