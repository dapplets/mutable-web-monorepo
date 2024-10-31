import browser from 'webextension-polyfill'
import { ParserConfig } from '@mweb/core'

export async function getAllLocalParserConfigs(): Promise<ParserConfig[]> {
  // ToDo: optimize
  const data = await browser.storage.local.get(null)

  const parserConfigs = Object.keys(data)
    .filter((key) => key.includes('/parser/'))
    .map((key) => data[key])

  return parserConfigs as ParserConfig[]
}

export async function getLocalParserConfig(id: string): Promise<ParserConfig | null> {
  const data = await browser.storage.local.get(id)
  return (data[id] ?? null) as ParserConfig | null
}

export async function saveLocalParserConfig(parserConfig: ParserConfig): Promise<void> {
  await browser.storage.local.set({ [parserConfig.id]: parserConfig })
}

export async function deleteParser(id: string): Promise<void> {
  await browser.storage.local.remove(id)
}
