import { initBGFunctions } from 'chrome-extension-message-wrapper'
import browser from 'webextension-polyfill'
import { BgFunctions } from '../background'

const Background: BgFunctions = new Proxy(
  {},
  {
    get(_, prop: keyof BgFunctions) {
      return (...args: unknown[]) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return initBGFunctions(browser).then((bg: BgFunctions) => bg[prop](...args))
      }
    },
  }
) as BgFunctions

export default Background
