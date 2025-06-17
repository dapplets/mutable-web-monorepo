import { Module } from '@nestjs/common';
import { NearAiService } from './nearai.service';

@Module({
  imports: [],
  providers: [NearAiService],
  controllers: [],
  exports: [NearAiService],
})
export class NearAiModule {}
