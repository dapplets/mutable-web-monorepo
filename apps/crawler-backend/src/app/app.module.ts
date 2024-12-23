import { Module } from '@nestjs/common';
import { ContextModule } from 'src/context/context.module';

@Module({
  imports: [ContextModule],
})
export class AppModule {}
