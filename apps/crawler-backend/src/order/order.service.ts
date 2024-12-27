import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersRepository.save(createOrderDto);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['jobs', 'jobs.steps'],
    });
  }

  async findOne(id: string): Promise<Order | null> {
    return this.ordersRepository.findOneBy({ id });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const existingOrder = await this.findOne(id);
    if (!existingOrder) {
      return null;
    }
    const updatedOrder = this.ordersRepository.merge(
      existingOrder,
      updateOrderDto,
    );
    return this.ordersRepository.save(updatedOrder);
  }

  async remove(id: number): Promise<void> {
    await this.ordersRepository.delete(id);
  }
}
