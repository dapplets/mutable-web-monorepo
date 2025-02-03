import { initBGFunctions } from './messenger'
import browser from 'webextension-polyfill'
import { CsFunctions } from '../contentscript'

const HandlerName = 'cs'

const ContentScript: (tabId?: number) => CsFunctions = (tabId) => {
  const fakeSendMessage = async (message: unknown) => {
    if (tabId) {
      return browser.tabs.sendMessage(tabId, message)
    } else {
      const [currentTab] = await browser.tabs.query({ currentWindow: true, active: true })
      if (!currentTab || !currentTab.id) throw new Error('No active tab')
      return browser.tabs.sendMessage(currentTab.id, message)
    }
  }

  const fakeBrowser = { runtime: { sendMessage: fakeSendMessage } }

  return new Proxy(
    {},
    {
      get(_, prop: keyof CsFunctions) {
        return (...args: unknown[]) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return initBGFunctions(fakeBrowser, { handlerName: HandlerName }).then((bg) =>
            bg[prop](...args)
          )
        }
      },
    }
  ) as CsFunctions
}

export default ContentScript
