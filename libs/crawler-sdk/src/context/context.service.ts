import { Client } from '../client'
import { GetContextDto } from './dtos/get-context.dto'
import { StoreContextResponseDto } from './dtos/store-context-response.dto'
import { StoreContextDto } from './dtos/store-context.dto'
import { GetContextsDto } from './dtos/get-contexts.dto'

export class ContextService {
  constructor(public readonly client: Client) {}

  findAll = async (): Promise<GetContextsDto> => {
    return this.client.get('context')
  }

  save = async (contextDto: StoreContextDto): Promise<StoreContextResponseDto> => {
    return this.client.post('context', contextDto)
  }

  get = async (hash: string): Promise<GetContextDto> => {
    return this.client.get(`context/${hash}`)
  }
}
