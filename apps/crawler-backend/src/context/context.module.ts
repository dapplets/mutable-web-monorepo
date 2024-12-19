import { Module } from '@nestjs/common';
import { ContextController } from './context.controller';
import { ContextService } from './context.service';

@Module({
  imports: [],
  controllers: [ContextController],
  providers: [ContextService],
})
export class ContextModule {}
