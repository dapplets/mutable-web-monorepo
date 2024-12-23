import fs from 'fs'
import path from 'path'
import puppeteer, { Page, Browser } from 'puppeteer'
import { GetOrderDto, GetStepDto } from '@mweb/crawler-sdk'
import { autoScroll } from './utils/auto-scroll'
import { CrawlerSdk } from '@mweb/crawler-sdk'

const DefaultCrawlerAgentConfig: CrawlerAgentConfig = {
  parallel: 3,
  apiUrl: process.env.API_URL ?? 'http://localhost:3001',
}

export type CrawlerAgentConfig = {
  parallel: number
  apiUrl: string
}

export class CrawlerAgent {
  config: CrawlerAgentConfig
  api: CrawlerSdk

  constructor(config: Partial<CrawlerAgentConfig> = {}) {
    this.config = {
      parallel: config.parallel ?? DefaultCrawlerAgentConfig.parallel,
      apiUrl: config.apiUrl ?? DefaultCrawlerAgentConfig.apiUrl,
    }

    this.api = new CrawlerSdk({ apiUrl: this.config.apiUrl })

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
    } catch (e) {
      console.error('Error processing orders:', e)
      throw e
    } finally {
      await browser.close()
    }
  }

  private async processOrder(order: GetOrderDto, browser: Browser) {
    console.log('created page')

    const page = await browser.newPage()

    for (const job of order.jobs) {
      for (const step of job.steps) {
        await this._processStep(step, page)
      }
    }

    await page.close()
  }

  private async _processStep(step: GetStepDto, page: Page) {
    let count = 0

    await page.exposeFunction('handleChildContextAdded', async (subtree: any) => {
      count++

      // ToDo: hardcoded
      // ToDo: agent should be stateless, but the backend requires to store receipts
      try {
        console.log('Saving contexts')
        const receipts = await this.api.context.save({ context: subtree, receiverId: 'hardcoded' })
        console.log('Saved contexts', receipts)
      } catch (err) {
        console.error(err)
      }
    })

    await page.goto(step.url, { waitUntil: 'networkidle0' })

    await page.setViewport({ width: 1920, height: 1080 })

    // ToDo: load parser by its ID
    const coreScript = fs.readFileSync(path.join(__dirname, '../inpage/index.js'), 'utf-8')
    await page.addScriptTag({ content: coreScript })

    await autoScroll(page)

    console.log(`Found ${count} contexts`)
  }
}
