import { initBGFunctions } from './messenger'
import browser from 'webextension-polyfill'
import { SpFunctions } from '../sidepanel'

const HandlerName = 'sp'

const SidePanel: () => SpFunctions = () => {
  const fakeSendMessage = async (message: unknown) => {
    return browser.runtime.sendMessage(message)
  }

  const fakeBrowser = { runtime: { sendMessage: fakeSendMessage } }

  return new Proxy(
    {},
    {
      get(_, prop: keyof SpFunctions) {
        return (...args: unknown[]) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return initBGFunctions(fakeBrowser, { handlerName: HandlerName }).then((bg) =>
            bg[prop](...args)
          )
        }
      },
    }
  ) as SpFunctions
}

export default SidePanel
