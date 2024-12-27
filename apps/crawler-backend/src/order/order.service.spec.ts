import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job, Order, Step } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          entities: [Order, Job, Step],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Order, Job, Step]),
      ],
      providers: [OrderService],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create order', async () => {
    const createOrderDto: CreateOrderDto = {
      jobs: [
        {
          schedule: '0 0 * * *',
          steps: [
            {
              parserId: 'parser-1',
              url: 'https://example.com',
            },
            {
              parserId: 'parser-2',
              url: 'https://another.com',
            },
          ],
        },
      ],
    };

    const result = await service.create(createOrderDto);

    expect(result).toBeDefined();
  });
});
