import * as WalletService from './wallet-service'
import * as SettingsService from './settings-service'
import * as ChatGptService from './chatgpt-service'
import * as LocalParserService from './local-parser-service'
import * as ContextService from './context-service'
import * as EconomyService from './economy-service'
import * as MenuService from './menu-service'

export default {
  ...WalletService,
  ...SettingsService,
  ...ChatGptService,
  ...LocalParserService,
  ...ContextService,
  ...EconomyService,
  ...MenuService,
}
