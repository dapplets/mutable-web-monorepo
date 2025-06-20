import { Module } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { UserModule } from 'src/user';

@Module({
  imports: [UserModule],
  providers: [MonitorService],
  controllers: [],
  exports: [MonitorService],
})
export class MonitorModule {}
