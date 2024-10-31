import browser from 'webextension-polyfill'
import { ClonedContextNode } from '../common/types'
import { ParserConfig } from '@mweb/core'

async function getCurrentTab(): Promise<browser.Tabs.Tab | null> {
  const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true })
  return currentTab
}

async function getSuitableParserConfigs(): Promise<any[]> {
  const currentTab = await getCurrentTab()
  if (!currentTab?.id) throw new Error('No active tab')

  const parsers = await browser.tabs.sendMessage(currentTab.id, {
    type: 'GET_SUITABLE_PARSERS',
  })

  return parsers as any[]
}

async function getContextTree(): Promise<ClonedContextNode> {
  const currentTab = await getCurrentTab()
  if (!currentTab?.id) throw new Error('No active tab')

  const contextTree = await browser.tabs.sendMessage(currentTab.id, {
    type: 'GET_CONTEXT_TREE',
  })

  return contextTree as ClonedContextNode
}

async function generateParserConfig(): Promise<ParserConfig | null> {
  const currentTab = await getCurrentTab()
  if (!currentTab?.id) throw new Error('No active tab')

  const parserConfig = await browser.tabs.sendMessage(currentTab.id, {
    type: 'GENERATE_PARSER_CONFIG',
  })

  return parserConfig as ParserConfig
}

function onActiveTabChange(callback: () => void) {
  const listener = (_: number, __: browser.Tabs.OnUpdatedChangeInfoType, tab: browser.Tabs.Tab) => {
    if (tab.active) {
      callback()
    }
  }

  browser.tabs.onActivated.addListener(callback)
  browser.tabs.onUpdated.addListener(listener)

  return {
    unsubscribe: () => {
      browser.tabs.onActivated.removeListener(callback)
      browser.tabs.onUpdated.removeListener(listener)
    },
  }
}

async function ping(): Promise<boolean> {
  const currentTab = await getCurrentTab()
  if (!currentTab?.id) return false

  try {
    const result = await browser.tabs.sendMessage(currentTab.id, {
      type: 'PING',
    })

    return result === 'PONG'
  } catch (_) {
    return false
  }
}

export default {
  getCurrentTab,
  getSuitableParserConfigs,
  getContextTree,
  generateParserConfig,
  onActiveTabChange,
  ping,
}
