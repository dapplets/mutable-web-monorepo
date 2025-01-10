import fs from 'fs'
import path from 'path'
import puppeteer, { Browser } from 'puppeteer'
import { autoScroll } from './utils/auto-scroll'
import { CrawlerSdk, GetJobDto, GetOrderDto, GetStepDto } from '@mweb/crawler-sdk'
import { Engine } from '@mweb/backend'

export class OrderExecutor {
  browser: Browser | null = null

  // ToDo: make dependencies more specific
  constructor(
    private mWebEngine: Engine,
    private api: CrawlerSdk
  ) {
    console.log('CrawlerAgent initialized')
  }

  async launch() {
    if (this.browser) {
      return
    }

    console.log('Launching browser')

    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    })
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  public async processJob(job: GetJobDto) {
    console.log(`Executing job: ${job.id}`)

    if (!this.browser) {
      throw new Error('Browser not launched')
    }

    for (const step of job.steps) {
      await this._processStep(step, this.browser)
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
