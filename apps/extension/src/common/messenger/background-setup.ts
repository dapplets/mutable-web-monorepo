import { CHROME_EXT_TOOLKIT, INVOKE_FUNCTION, GET_FUNCTION_NAMES } from './constants'
import { isFunction, isObject, isPromise, Logger } from './utils'

type AnyObject = Record<string, any>
type Request = {
  handler?: string
  type?: string
  payload?: {
    path: string[]
    args: any[]
  }
}
type Sender = chrome.runtime.MessageSender
type BackgroundFunctions = Record<string, any>
type Response = {
  result?: any
  error?: string
}
type Options = {
  verbose?: boolean
  logRequest?: (req: Request) => void
  handlerName?: string
  customHandler?: (req: Request, sender: Sender) => any
}

/**
 * A small helper which is used to get variables in deeply nested objects.
 *
 * @param object The object to search in.
 * @param path The path to the variable inside the object.
 * @return Returns either an object, function or undefined depending on the path.
 */
export const find = (object: AnyObject, path: string[]): any => {
  if (path.length > 0) {
    let ret = object[path[0]]
    if (isObject(ret)) {
      ret = find(ret, path.slice(1))
    } else if (path.slice(1).length > 0) {
      return undefined
    }
    return ret
  }

  return object
}

/**
 * Calls a function from the background functions, based on the request.
 *
 * @param req The request object.
 * @param sender The sender object.
 * @param bgFuncs The background functions.
 * @returns A Promise resolving to a Response object.
 */
export const invokeFunction = (
  req: Request,
  sender: Sender,
  bgFuncs: BackgroundFunctions
): Promise<Response> | undefined => {
  const targetFunction = find(bgFuncs, req.payload?.path || [])
  if (targetFunction && isFunction(targetFunction)) {
    try {
      let ret = targetFunction(...(req.payload?.args || []), {
        request: req,
        sender,
      })

      if (isPromise(ret)) {
        return ret
          .then((result: any) => ({ result }))
          .catch((error: Error) => {
            console.error(error)
            return { error: error.message }
          })
      }

      return Promise.resolve({ result: ret })
    } catch (error: any) {
      console.error(error)
      return Promise.resolve({ error: error.message })
    }
  }

  return undefined
}

/**
 * Uses the background functions to create an object with the same structure,
 * only with names of the functions instead of the functions themselves.
 *
 * @param obj Functions inside an object.
 * @returns An object with the same structure but containing only function names.
 */
export const mapNames = (obj: BackgroundFunctions): AnyObject =>
  Object.keys(obj).reduce<AnyObject>((acc, key) => {
    let ret: any = key
    if (isObject(obj[key])) {
      ret = mapNames(obj[key])
    }
    return { ...acc, [key]: ret }
  }, {})

/**
 * Function which creates the message listener.
 * This should be passed in chrome.runtime.onMessage.addListener.
 *
 * @param bgFuncs Functions which should be available to the content/popup scripts.
 * @param options Options to configure logging, custom message handling, etc.
 * @returns A listener function which takes Request, Sender, and optionally SendResponse.
 */
const setupMessageListener = (
  bgFuncs: BackgroundFunctions = {},
  options: Options = {}
): ((req: Request, sender: Sender) => any) => {
  const logger = Logger(options)
  const mappedBackgroundFunctions = mapNames(bgFuncs)

  return (req: Request, sender: Sender) => {
    if (req.handler === (options.handlerName ?? CHROME_EXT_TOOLKIT)) {
      switch (req.type) {
        case GET_FUNCTION_NAMES:
          return Promise.resolve({
            result: mappedBackgroundFunctions,
          })
        case INVOKE_FUNCTION:
          if (options.logRequest) {
            options.logRequest(req)
          }
          return invokeFunction(req, sender, bgFuncs)
        default:
          return undefined
      }
    } else if (options.customHandler) {
      return options.customHandler(req, sender)
    }
  }
}

export default setupMessageListener
