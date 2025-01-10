import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ContextModule } from '../context/context.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from 'src/order/order.module';
import { Job, Order, Step } from 'src/order/entities/order.entity';

@Module({
  imports: [
    ContextModule,
    OrderModule,
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [Order, Job, Step],
      synchronize: true,
      logging: false,
    }),
  ],
})
export class AppModule {}
