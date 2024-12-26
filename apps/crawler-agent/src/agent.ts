import cron from 'node-cron'
import { CrawlerSdk, GetOrderDto } from '@mweb/crawler-sdk'
import { Engine, InMemoryStorage } from '@mweb/backend'
import { OrderExecutor } from './order-executor'

const DefaultCrawlerAgentConfig: CrawlerAgentConfig = {
  apiUrl: process.env.API_URL ?? 'http://localhost:3001',
  networkId: 'testnet', // ToDo: or mainnet?
}

export type CrawlerAgentConfig = {
  apiUrl: string
  networkId: string
}

export class CrawlerAgent {
  config: CrawlerAgentConfig
  api: CrawlerSdk
  mWebEngine: Engine
  executor: OrderExecutor

  constructor(config: Partial<CrawlerAgentConfig> = {}) {
    this.config = {
      apiUrl: config.apiUrl ?? DefaultCrawlerAgentConfig.apiUrl,
      networkId: config.networkId ?? DefaultCrawlerAgentConfig.networkId,
    }

    this.api = new CrawlerSdk({ apiUrl: this.config.apiUrl })

    this.mWebEngine = new Engine({
      networkId: this.config.networkId,
      gatewayId: 'crawler-agent',
      selector: null as any, // ToDo: readonly
      storage: new InMemoryStorage(), // ToDo: do not need local repositories
    })

    this.executor = new OrderExecutor(this.mWebEngine, this.api)

    console.log('CrawlerAgent initialized')
  }

  async launch() {
    await this.executor.launch()

    await this._findNewOrders()

    cron.schedule('* * * * *', () => this._findNewOrders(), { name: 'find-new-orders' })
  }

  async scheduleJobsForOrder(order: GetOrderDto) {
    order.jobs.forEach((job) => {
      if (cron.getTasks().has(job.id)) {
        return
      }

      console.log(`Found new job ${job.id} with schedule: ${job.schedule}`)

      if (!cron.validate(job.schedule)) {
        console.warn(`Invalid cron schedule for job: ${job.id}, skipping.`)
        return
      }

      cron.schedule(
        job.schedule,
        async () => {
          console.log(`Executing job: ${job.id} for order: ${order.id}`)
          try {
            await this.executor.processJob(job)
          } catch (error) {
            console.error(`Error processing job: ${job.id} in order: ${order.id}`, error)
          }
        },
        { name: job.id }
      )
    })
  }

  async close() {
    await this.executor.close()
  }

  async _findNewOrders() {
    console.log('Fetching orders from API...')
    const orders = await this.api.order.findAll()

    for (const order of orders) {
      await this.scheduleJobsForOrder(order)
    }
  }
}
