import { initBGFunctions } from 'chrome-extension-message-wrapper'
import browser from 'webextension-polyfill'
import { BgFunctions } from '../background'

const bg: Promise<BgFunctions> = initBGFunctions(browser)

export const tabs_query = (params) => bg.then((fn) => fn.tabs_query(params))
export const tabs_update = (id, params) => bg.then((fn) => fn.tabs_update(id, params))
export const tabs_create = (params) => bg.then((fn) => fn.tabs_create(params))
export const tabs_remove = (id) => bg.then((fn) => fn.tabs_remove(id))
export const getThisTab = (callInfo) => bg.then((fn) => fn.getThisTab(callInfo))
export const waitClosingTab = (tabId, windowId) =>
  bg.then((fn) => fn.waitClosingTab(tabId, windowId))
export const waitTab = (url) => bg.then((fn) => fn.waitTab(url))
