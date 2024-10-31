import browser from 'webextension-polyfill'
import { getStorageServerUrl } from './settings-service'

let promise: Promise<any> | null = null

async function unsafe_incrementContextCount(): Promise<void> {
  const { contextCount } = (await browser.storage.local.get('contextCount')) as {
    contextCount: number | null
  }
  await browser.storage.local.set({ contextCount: contextCount ? contextCount + 1 : 1 })
}

export async function storeContext(context: any): Promise<void> {
  // ToDo: memory leak?
  promise = promise
    ? promise.then(() => unsafe_incrementContextCount())
    : unsafe_incrementContextCount()

  const storageServerUrl = await getStorageServerUrl()

  // ToDo: use new URL
  // ToDo: extract to the separate service
  await fetch(storageServerUrl + '/context', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(context),
  })

  return promise
}

export async function getContextCount(): Promise<number> {
  const { contextCount } = (await browser.storage.local.get('contextCount')) as {
    contextCount: number | null
  }

  return contextCount ?? 0
}
