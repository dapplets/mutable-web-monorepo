import { MutationDto } from '@mweb/backend'

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep clones object.
 * @param object
 */
export const cloneDeep = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

/**
 * Deep compare two object.
 * @param a
 * @param b
 */
export const compareDeep = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Compare two Mutations.
 * @param m1
 * @param m2
 */
export const compareMutations = (m1: MutationDto, m2: MutationDto): boolean =>
  !(
    m1.id !== m2.id ||
    !compareDeep(m1.targets, m2.targets) ||
    !compareDeep(m1.metadata, m2.metadata) ||
    m1.apps.length !== m2.apps.length ||
    !compareDeep(m1.apps.sort(), m2.apps.sort())
  )

export const ipfsUpload = async (f: File) => {
  const res = await fetch('https://ipfs.near.social/add', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: f,
  })
  return (await res.json()).cid
}

/**
 * Deep merge two objects.
 * @param target
 * @param source
 */
export function mergeDeep<T extends object>(target: T, source: Partial<T>): T {
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return target
}

export function isValidSocialIdCharacters(value: string): boolean {
  return /^[a-zA-Z0-9_.\-/]*$/.test(value)
}

export const generateRandomHex = (size: number) =>
  [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')

export const capitalizeWords = (str: string) => str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())

export const getNameFromId = (id: string) => {
  const parts = id.split('/')
  return capitalizeWords(parts[parts.length - 1])
}
