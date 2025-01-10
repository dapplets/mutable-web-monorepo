import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job, Order, Step } from './entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Job, Step])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
