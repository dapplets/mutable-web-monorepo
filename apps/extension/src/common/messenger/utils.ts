export const isFunction = (x: any) => typeof x === 'function'
export const isObject = (x: any) => typeof x === 'object'
export const isPromise = (x: any) => isObject(x) && isFunction(x.then)

// Logger
/* eslint-disable no-console */
export const Logger = (options: { verbose?: boolean; logRequest?: (req: any) => any }) => ({
  log: options.verbose ? console.log : () => undefined,
  logRequest: options.verbose
    ? (req: any) =>
        console.log(
          (options.logRequest && options.logRequest(req)) ||
            `Got request to call a function: ${req}`
        )
    : () => undefined,
})
