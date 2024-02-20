import browser from 'webextension-polyfill'

async function _get(key: string): Promise<unknown | null> {
  const data = await browser.storage.local.get(key)
  return data?.[key]
}

async function _set(key: string, value: string): Promise<void> {
  await browser.storage.local.set({ [key]: value })
}

export async function getCurrentMutationId(hostname: string): Promise<string | null> {
  return _get(`mutationId:${hostname}`) as Promise<string>
}

export async function setCurrentMutationId(hostname: string, mutationId: string): Promise<void> {
  await _set(`mutationId:${hostname}`, mutationId)
}
