import { CreateOrderDto } from './dtos/create-order.dto'
import { GetOrderDto } from './dtos/get-order.dto'
import { Client } from '../client'

export class OrderService {
  constructor(private client: Client) {}

  create = async (createOrderDto: CreateOrderDto): Promise<GetOrderDto> => {
    return this.client.post('order', createOrderDto)
  }

  findAll = async (): Promise<GetOrderDto[]> => {
    return this.client.get('order')
  }

  get = (id: string): Promise<GetOrderDto> => {
    return this.client.get(`order/${id}`)
  }

  update = (updateOrderDto: GetOrderDto): Promise<GetOrderDto> => {
    return this.client.patch(`order/${updateOrderDto.id}`, updateOrderDto)
  }

  remove = (id: string): Promise<void> => {
    return this.client.delete(`order/${id}`)
  }
}
