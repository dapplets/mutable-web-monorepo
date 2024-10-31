import browser from 'webextension-polyfill'
import { crawlerConfig, DefaultNetworkId, NearNetworkId } from '../../common/networks'

type Settings = {
  devServerUrl: string | null
  networkId: NearNetworkId
  organizationId: string | null
  assistantId: string | null
  projectId: string | null
  chatGptApiKey: string | null
  storageServerUrl: string | null
}

const get = async <K extends keyof Settings>(key: K): Promise<Settings[K]> => {
  const result = await browser.storage.local.get(key)
  return result[key] as Settings[K]
}

const set = async (data: Partial<Settings>): Promise<void> => {
  await browser.storage.local.set(data)
}

export const getDevServerUrl = async (): Promise<string | null> => {
  return get('devServerUrl')
}

export const setDevServerUrl = async (devServerUrl: string | null): Promise<void> => {
  await set({ devServerUrl })
}

export const getCurrentNetwork = async (): Promise<NearNetworkId> => {
  return (await get('networkId')) ?? DefaultNetworkId
}

export const switchNetwork = async (networkId: NearNetworkId) => {
  await set({ networkId })
  browser.runtime.reload()
}

export const getOrganizationId = async (): Promise<string | null> => {
  return (await get('organizationId')) ?? crawlerConfig.organizationId
}

export const setOrganizationId = async (organizationId: string | null): Promise<void> => {
  await set({ organizationId })
}

export const getProjectId = async (): Promise<string | null> => {
  return (await get('projectId')) ?? crawlerConfig.projectId
}

export const setProjectId = async (projectId: string | null): Promise<void> => {
  await set({ projectId })
}

export const getChatGptApiKey = async (): Promise<string | null> => {
  return (await get('chatGptApiKey')) ?? crawlerConfig.chatGptApiKey
}

export const setChatGptApiKey = async (chatGptApiKey: string | null): Promise<void> => {
  await set({ chatGptApiKey })
}

export const getAssistantId = async (): Promise<string | null> => {
  return (await get('assistantId')) ?? crawlerConfig.assistantId
}

export const setAssistantId = async (assistantId: string | null): Promise<void> => {
  await set({ assistantId })
}

export const getStorageServerUrl = async (): Promise<string | null> => {
  return (await get('storageServerUrl')) ?? crawlerConfig.storageServerUrl
}

export const setStorageServerUrl = async (storageServerUrl: string | null): Promise<void> => {
  await set({ storageServerUrl })
}
