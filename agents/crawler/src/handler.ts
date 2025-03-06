import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import { autoScroll } from './auto-scroll'
import { Engine, InMemoryStorage, utils } from '@mweb/backend'
import { ClonedContextNode } from './types'

/*
Input context example:
{
  "context": {
    "namespace": "engine",
    "contextType": "website",
    "id": "github.com",
    "parsedContext": {
      "id": "github.com",
      "url": "https://github.com/dapplets/mutable-web-monorepo/pull/54"
    }
  }
}
*/

const engine = new Engine({
  networkId: 'testnet', // ToDo: or mainnet?
  gatewayId: 'crawler-agent',
  selector: null as any, // ToDo: readonly
  storage: new InMemoryStorage(), // ToDo: do not need local repositories
})

export async function handler(input: { context: ClonedContextNode }): Promise<{
  contexts: ClonedContextNode[]
}> {
  const { context } = input

  if (!context || context.contextType !== 'website' || context.namespace !== 'engine') {
    console.error(`Invalid context: ${JSON.stringify(context)}`)
    return { contexts: [] }
  }

  if (!context.parsedContext.url) {
    console.error(`No URL in context: ${JSON.stringify(context)}`)
    return { contexts: [] }
  }

  // ToDo:
  const url = context.parsedContext.url

  const parserConfigs = await engine.parserConfigService.getAllParserConfigs()
  const suitableParserConfigs = parserConfigs.filter(
    (pc) => pc.targets.some((target) => utils.isTargetMet(target, context as any)) // ToDo
  )

  if (suitableParserConfigs.length === 0) {
    console.error(`Suitable parser configs not found for ${url}`)
    return { contexts: [] }
  }

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })

  const page = await browser.newPage()

  try {
    const contexts: ClonedContextNode[] = []

    await page.exposeFunction('handleGetParserConfigs', () =>
      suitableParserConfigs.map((pc) => JSON.parse(JSON.stringify(pc)))
    )

    await page.exposeFunction('handleChildContextAdded', async (subtree: any) => {
      contexts.push(subtree)
    })

    console.log(`Visiting URL: ${url}`)

    await page.setBypassCSP(true) //
    await page.goto(url, { waitUntil: 'networkidle0' })
    await page.setViewport({ width: 1920, height: 1080 })

    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))

    // ToDo: load parser by its ID
    const coreScript = fs.readFileSync(path.join(__dirname, '../inpage/index.js'), 'utf-8')
    await page.addScriptTag({ content: coreScript })

    await autoScroll(page)

    console.log(`Found ${contexts.length} contexts`)

    return { contexts }
  } catch (err) {
    console.error(err)
  } finally {
    await page.close()
    await browser.close()
  }

  return { contexts: [] }
}
