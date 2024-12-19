import puppeteer, { Page, Browser } from 'puppeteer'

import fs from 'fs'
import path from 'path'

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      var totalHeight = 0
      var distance = 100
      var timer = setInterval(() => {
        // @ts-ignore
        var scrollHeight = document.body.scrollHeight
        // @ts-ignore
        window.scrollBy(0, distance)
        totalHeight += distance

        // @ts-ignore
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer)
          resolve()
        }
      }, 100)
    })
  })
}

async function createAndProcessPage(browser: Browser): Promise<void> {
  console.log('created page')
  const coreScript = fs.readFileSync(path.join(__dirname, '../inpage/index.js'), 'utf-8')

  const page = await browser.newPage()

  let count = 0

  await page.exposeFunction('handleChildContextAdded', async (subtree: any) => {
    count++

    console.log(subtree)

    const response = await fetch('https://crawler-api.apps.dapplets.org/context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ context: subtree, receiverId: 'hardcoded' }),
    })
  })

  await page.goto('https://dapplets-e2e.netlify.app/dapplets', { waitUntil: 'networkidle0' })

  await page.setViewport({ width: 1920, height: 1080 })

  await page.addScriptTag({ content: coreScript })

  await autoScroll(page)

  console.log(`Found ${count} contexts`)

  await page.close();
}

export class CrawlerAgent {
  constructor() {
    console.log('CrawlerAgent initialized')
  }

  async run() {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    })

    try {
      await Promise.all([
        createAndProcessPage(browser),
        createAndProcessPage(browser),
        createAndProcessPage(browser),
      ])
    } catch (e) {
      throw e
    } finally {
      await browser.close()
    }
  }
}
