import { setupMessageListener } from 'chrome-extension-message-wrapper'
import browser from 'webextension-polyfill'
import ServiceFunctions from './services'

export type BgFunctions = typeof ServiceFunctions

browser.runtime.onMessage.addListener(setupMessageListener(ServiceFunctions))
