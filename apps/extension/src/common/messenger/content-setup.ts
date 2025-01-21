import { Browser } from 'webextension-polyfill'
import { CHROME_EXT_TOOLKIT, INVOKE_FUNCTION, GET_FUNCTION_NAMES } from './constants'

import { isObject } from './utils'

type Message = {
  handler: string
  type: string
  payload?: {
    path: string[]
    args: any[]
  }
}
type Response = {
  result?: any
  error?: string
}

type BackgroundFunctions = Record<string, any>
type Options = {
  handlerName?: string
}

type SendMessage = (msg: Message) => Promise<any>

/**
 * Creates a sendMessage function that wraps browser.runtime.sendMessage.
 *
 * @param browser The webextension browser object.
 * @returns A sendMessage function.
 */
export const makeSendMessage =
  (browser: Browser): SendMessage =>
  async (msg: Message) => {
    const response: Response = await browser.runtime.sendMessage(msg)
    if (response.error) {
      throw new Error(response.error)
    } else {
      return response.result
    }
  }

/**
 * Creates a function that sends messages to invoke background script functions.
 *
 * @param sendMessage The sendMessage function.
 * @param handlerName The handler name.
 * @returns A function that creates background script invocations.
 */
export const makeCreateFunction =
  (sendMessage: SendMessage, handlerName?: string) =>
  (path: string[]) =>
  (...args: any[]) =>
    sendMessage({
      handler: handlerName ?? CHROME_EXT_TOOLKIT,
      type: INVOKE_FUNCTION,
      payload: {
        path,
        args,
      },
    })

/**
 * Recursively maps over the background function names and creates callable functions.
 *
 * @param createFunction The function to create callable entries.
 * @param obj The object of background function names.
 * @param path The current path in the object.
 * @returns An object with callable functions.
 */
export const addEntry = (
  createFunction: (path: string[]) => (...args: any[]) => Promise<any>,
  obj: BackgroundFunctions,
  path: string[] = []
): BackgroundFunctions =>
  Object.keys(obj).reduce<BackgroundFunctions>((acc, key) => {
    const ret = isObject(obj[key])
      ? addEntry(createFunction, obj[key], [...path, key])
      : createFunction([...path, key])
    return { ...acc, [key]: ret }
  }, {})

/**
 * Initializes functions from the background script.
 *
 * @param browser The webextension browser object.
 * @param options Optional configuration options.
 * @returns A promise resolving to an object with the background functions.
 */
export const setupBackgroundFunctions = (
  browser: Browser,
  options: Options = {}
): Promise<{ send: SendMessage } & BackgroundFunctions> => {
  const sendMessage = makeSendMessage(browser)
  const createFunction = makeCreateFunction(sendMessage, options.handlerName)
  return sendMessage({
    handler: options.handlerName ?? CHROME_EXT_TOOLKIT,
    type: GET_FUNCTION_NAMES,
  }).then((bgFuncs: BackgroundFunctions) => {
    return {
      send: sendMessage,
      ...addEntry(createFunction, bgFuncs),
    }
  })
}

export default setupBackgroundFunctions
