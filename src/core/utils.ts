import { IContextNode } from '../core'

export function isDeepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
    return false
  }

  const keysA = Object.keys(obj1)
  const keysB = Object.keys(obj2)

  if (keysA.length !== keysB.length) {
    return false
  }

  let result = true

  keysA.forEach((key) => {
    if (!keysB.includes(key)) {
      result = false
    }

    if (typeof obj1[key] === 'function' || typeof obj2[key] === 'function') {
      if (obj1[key].toString() !== obj2[key].toString()) {
        result = false
      }
    }

    if (!isDeepEqual(obj1[key], obj2[key])) {
      result = false
    }
  })

  return result
}

export const getElementDepth = (el: Element | Node) => {
  let depth = 0
  let host = (el as any).host
  while (el.parentNode !== null || host) {
    if (host) el = host as Node
    el = el.parentNode!
    host = (el as any).host
    depth++
  }
  return depth
}

export const getContextDepth = (context: IContextNode): number => {
  return context.element ? getElementDepth(context.element) : 0
}
