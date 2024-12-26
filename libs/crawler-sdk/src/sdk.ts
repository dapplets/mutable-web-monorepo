import { Client, ClientConfig } from './client'
import { ContextService } from './context'
import { OrderService } from './order'

export class CrawlerSdk {
  private _client: Client
  public order: OrderService
  public context: ContextService

  constructor(config: ClientConfig) {
    this._client = new Client(config)
    this.order = new OrderService(this._client)
    this.context = new ContextService(this._client)
  }
}
