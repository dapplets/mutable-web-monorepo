import { Module } from '@nestjs/common';
import { N8NService } from './n8n.service';

@Module({
  imports: [],
  providers: [N8NService],
  controllers: [],
  exports: [N8NService],
})
export class N8NModule {}
