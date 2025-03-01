import { Module } from '@nestjs/common';
import { ContextModule } from '../context/context.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from 'src/order/order.module';
import { Job, Order, Step } from 'src/order/entities/order.entity';
import { ContextNode, ContextEdge } from 'src/context/entities/context.entity';

@Module({
  imports: [
    ContextModule,
    OrderModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      entities: [Order, Job, Step, ContextNode, ContextEdge],
      database: 'mweb',
      synchronize: true,
    }),
  ],
})
export class AppModule {}
