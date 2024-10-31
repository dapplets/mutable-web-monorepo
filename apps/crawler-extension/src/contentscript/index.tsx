import { Engine, EngineConfig, utils } from '@mweb/backend'
import { Core, IContextNode } from '@mweb/core'
import { setupWalletSelector } from '@near-wallet-selector/core'
import { EventEmitter as NEventEmitter } from 'events'
import browser from 'webextension-polyfill'
import Background from '../common/background'
import { ClonedContextNode } from '../common/types'
import { ExtensionStorage } from './extension-storage'
import { setupWallet } from './wallet'

const eventEmitter = new NEventEmitter()
const networkIdPromise = Background.getCurrentNetwork()

// The wallet selector looks like an unnecessary abstraction layer over the "mutable-web-extension" wallet
// but we have to use it because near-social-vm uses not only a wallet object, but also a selector state
// object and its Observable for event subscription
const selectorPromise = networkIdPromise.then((networkId) =>
  setupWalletSelector({
    network: networkId,
    // The storage is faked because it's not necessary. The selected wallet ID is hardcoded below
    storage: new ExtensionStorage(`wallet-selector:${networkId}`),
    modules: [setupWallet({ eventEmitter })],
  }).then((selector) => {
    // Use background wallet by default
    const wallet = selector.wallet
    selector.wallet = () => wallet('mutable-web-extension')
    return selector
  })
)

async function main() {
  const engineConfig: EngineConfig = {
    networkId: await networkIdPromise,
    gatewayId: 'crawler-extension',
    selector: await selectorPromise,
    storage: new ExtensionStorage('mutableweb'),
    bosElementStyleSrc: browser.runtime.getURL('bootstrap.min.css'),
  }

  await engineConfig.selector.wallet()

  const core = new Core()
  const engine = new Engine(engineConfig)

  const [remoteParsers, localParsers] = await Promise.all([
    engine.parserConfigService.getAllParserConfigs(),
    Background.getAllLocalParserConfigs(),
  ])

  const suitableParsers = ([...remoteParsers, ...localParsers] as any[]).filter((p) =>
    p.targets.some((t: any) => utils.isTargetMet(t, core.tree))
  )

  suitableParsers.forEach((p) => core.attachParserConfig(p))

  async function generateParserConfig() {
    const pc: any = await Background.generateParserConfigByUrl(location.href)
    if (!pc) throw new Error('Cannot generate parser config')

    if (!pc.targets.some((t: any) => utils.isTargetMet(t, core.tree))) {
      throw new Error('The generated parser config is not suitable for this web site. Try again')
    }

    await Background.saveLocalParserConfig(pc)

    suitableParsers.push(pc as any)
    core.attachParserConfig(pc)
  }

  browser.runtime.onMessage.addListener((message: any) => {
    if (!message || !message.type) return
    if (message.type === 'PING') {
      // Used for background. When user clicks on the extension icon, content script may be not injected.
      // It's a way to check liveness of the content script
      return Promise.resolve('PONG')
    } else if (message.type === 'COPY') {
      navigator.clipboard.writeText(message.address)
    } else if (message.type === 'SIGNED_IN') {
      eventEmitter.emit('signedIn', message.params)
    } else if (message.type === 'SIGNED_OUT') {
      eventEmitter.emit('signedOut')
    } else if (message.type === 'OPEN_NEW_MUTATION_POPUP') {
      // ToDo: eventEmitter is intended for near-wallet-selector
      eventEmitter.emit('openMutationPopup')
    } else if (message.type === 'GET_CONTEXT_TREE') {
      return Promise.resolve(cloneContextTree(core.tree))
    } else if (message.type === 'GET_SUITABLE_PARSERS') {
      return Promise.resolve(suitableParsers)
    } else if (message.type === 'GENERATE_PARSER_CONFIG') {
      return Promise.resolve(generateParserConfig())
    }
  })
}

function cloneContextTree(tree: IContextNode): ClonedContextNode {
  const clonedParsedContext = { ...tree.parsedContext }
  delete clonedParsedContext.id

  return {
    namespace: tree.namespace,
    contextType: tree.contextType,
    id: tree.id,
    parsedContext: clonedParsedContext,
    children: tree.children.map((child) => cloneContextTree(child)),
  }
}

main().catch(console.error)
