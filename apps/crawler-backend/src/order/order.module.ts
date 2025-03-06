import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job, Order, Step } from './entities/order.entity';
import { SchedulerModule } from 'src/scheduler/scheduler.module';
import { ContextModule } from 'src/context/context.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Job, Step]),
    SchedulerModule,
    ContextModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
