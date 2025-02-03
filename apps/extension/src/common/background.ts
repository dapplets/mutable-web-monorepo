import { initBGFunctions } from './messenger'
import browser from 'webextension-polyfill'
import { BgFunctions } from '../background'

const Background: BgFunctions = new Proxy(
  {},
  {
    get(_, prop: keyof BgFunctions) {
      return (...args: unknown[]) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return initBGFunctions(browser, { handlerName: 'bg' }).then((bg) => bg[prop](...args))
      }
    },
  }
) as BgFunctions

export default Background
