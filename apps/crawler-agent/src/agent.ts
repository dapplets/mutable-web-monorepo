import fs from 'fs'
import path from 'path'
import puppeteer, { Page, Browser } from 'puppeteer'
import { GetOrderDto, GetStepDto } from '@mweb/crawler-sdk'
import { autoScroll } from './utils/auto-scroll'
import { CrawlerSdk } from '@mweb/crawler-sdk'
import { Engine, InMemoryStorage } from '@mweb/backend'

const DefaultCrawlerAgentConfig: CrawlerAgentConfig = {
  parallel: 3,
  apiUrl: process.env.API_URL ?? 'http://localhost:3001',
  networkId: 'testnet', // ToDo: or mainnet?
}

export type CrawlerAgentConfig = {
  parallel: number
  apiUrl: string
  networkId: string
}

export class CrawlerAgent {
  config: CrawlerAgentConfig
  api: CrawlerSdk
  mWebEngine: Engine

  constructor(config: Partial<CrawlerAgentConfig> = {}) {
    this.config = {
      parallel: config.parallel ?? DefaultCrawlerAgentConfig.parallel,
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

    console.log('CrawlerAgent initialized')
  }

  async run() {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    })

    // ToDo: pagination
    const orders = await this.api.order.findAll()

    console.log(`Found ${orders.length} orders`)

    const { parallel } = this.config

    try {
      // Divide orders into chunks for parallel processing
      const chunks = Array.from({ length: Math.ceil(orders.length / parallel) }, (_, i) =>
        orders.slice(i * parallel, i * parallel + parallel)
      )

      for (const chunk of chunks) {
        await Promise.all(chunk.map((order) => this.processOrder(order, browser)))
      }

      // ToDo: should we execute processed orders again?
    } catch (e) {
      console.error('Error processing orders:', e)
      throw e
    } finally {
      await browser.close()
    }
  }

  private async processOrder(order: GetOrderDto, browser: Browser) {
    console.log(`Executing order: ${order.id}`)

    for (const job of order.jobs) {
      for (const step of job.steps) {
        await this._processStep(step, browser)
      }
    }
  }

  private async _processStep(step: GetStepDto, browser: Browser) {
    console.log(`Downloading parser config: ${step.parserId}`)

    const parserConfig = await this.mWebEngine.parserConfigService.getParserConfig(step.parserId)

    if (!parserConfig) {
      console.error(`Parser "${step.parserId}" not found`)
      return
    }

    const page = await browser.newPage()

    try {
      let count = 0

      await page.exposeFunction('handleGetParserConfigs', () => [
        JSON.parse(JSON.stringify(parserConfig)),
      ])

      await page.exposeFunction('handleChildContextAdded', async (subtree: any) => {
        count++

        // ToDo: hardcoded
        // ToDo: agent should be stateless, but the backend requires to store receipts
        try {
          console.log('Saving contexts')
          await this.api.context.save({
            context: subtree,
            receiverId: 'hardcoded',
          })
          // ToDo: save receipts?
        } catch (err) {
          console.error(err)
        }
      })

      console.log(`Visiting URL: ${step.url}`)

      await page.setBypassCSP(true) //
      await page.goto(step.url, { waitUntil: 'networkidle0' })
      await page.setViewport({ width: 1920, height: 1080 })

      page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))

      // ToDo: load parser by its ID
      const coreScript = fs.readFileSync(path.join(__dirname, '../inpage/index.js'), 'utf-8')
      await page.addScriptTag({ content: coreScript })

      await autoScroll(page)

      console.log(`Found ${count} contexts`)
    } catch (err) {
      console.error(err)
    }

    await page.close()
  }
}
