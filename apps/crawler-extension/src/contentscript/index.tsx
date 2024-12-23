import { Engine, EngineConfig, utils } from '@mweb/backend'
import { Core, IContextNode, ParserConfig } from '@mweb/core'
import { setupWalletSelector } from '@near-wallet-selector/core'
import { EventEmitter as NEventEmitter } from 'events'
import browser from 'webextension-polyfill'
import Background from '../common/background'
import { ClonedContextNode } from '../common/types'
import { ExtensionStorage } from './extension-storage'
import { setupWallet } from './wallet'
import { Picker } from './picker'

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
  const picker = new Picker()

  core.tree.on('childContextAdded', handleNewContext)

  const [remoteParsers, localParsers] = await Promise.all([
    engine.parserConfigService.getAllParserConfigs(),
    Background.getAllLocalParserConfigs(),
  ])

  const suitableParsers = ([...remoteParsers, ...localParsers] as any[]).filter((p) =>
    p.targets.some((t: any) => utils.isTargetMet(t, core.tree))
  )

  console.log({ suitableParsers })

  let isError = false

  suitableParsers.forEach((p) => {
    try {
      core.attachParserConfig(p)
    } catch (err) {
      console.error(err)
    }
  })

  await setIsError(suitableParsers.length === 0)

  async function setIsError(value: boolean) {
    if (isError === value) return
    isError = value
    await Background.setIsError(value)
  }

  function handleNewContext({ child }: { child: IContextNode }) {
    child.on('childContextAdded', handleNewContext)
    Background.storeContext(cloneContextSubtree(child))
  }

  async function generateParserConfig() {
    const pc: any = await Background.generateParserConfigByUrl(location.href)
    if (!pc) throw new Error('Cannot generate parser config')

    console.log({ generatedParser: pc })

    if (!pc.targets.some((t: any) => utils.isTargetMet(t, core.tree))) {
      throw new Error('The generated parser config is not suitable for this web site. Try again')
    }

    await Background.saveLocalParserConfig(pc)

    suitableParsers.push(pc as any)

    try {
      core.attachParserConfig(pc)
    } catch (err) {
      console.error(err)
    }
  }

  async function improveParserConfig(pc: ParserConfig, html: string) {
    const newPc: any = await Background.improveParserConfig(pc as any, html)
    if (!newPc) throw new Error('Cannot improve parser config')

    console.log({ generatedParser: newPc, previousVersion: pc })

    if (!newPc.targets.some((t: any) => utils.isTargetMet(t, core.tree))) {
      throw new Error('The generated parser config is not suitable for this web site. Try again')
    }

    await Background.saveLocalParserConfig(newPc)

    core.detachParserConfig(pc.id)

    try {
      core.attachParserConfig(newPc)
      suitableParsers[suitableParsers.findIndex((p) => p.id === pc.id)] = newPc
    } catch (err) {
      console.error(err)
    }
  }

  async function deleteParser(pcId: string) {
    await Background.deleteParser(pcId)
    suitableParsers.splice(suitableParsers.indexOf(suitableParsers.find((p) => p.id === pcId)), 1)
    core.detachParserConfig(pcId)
  }

  async function saveLocalParserConfig(newPc: ParserConfig) {
    await Background.saveLocalParserConfig(newPc)
    core.detachParserConfig(newPc.id)

    try {
      core.attachParserConfig(newPc)
      const index = suitableParsers.findIndex((p) => p.id === newPc.id)
      if (~index) suitableParsers[index] = newPc
      else suitableParsers.push(newPc as any)
      return suitableParsers
    } catch (err) {
      console.error(err)
    }
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
    } else if (message.type === 'PICK_ELEMENT') {
      return Promise.resolve(picker.pickElement())
    } else if (message.type === 'IMPROVE_PARSER_CONFIG') {
      return Promise.resolve(improveParserConfig(message.params.parserConfig, message.params.html))
    } else if (message.type === 'DELETE_PARSER_CONFIG') {
      return Promise.resolve(deleteParser(message.params))
    } else if (message.type === 'SAVE_LOCAL_PARSER_CONFIG') {
      return Promise.resolve(saveLocalParserConfig(message.params))
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

function cloneContextSubtree(node: IContextNode): ClonedContextNode {
  const clonedParsedContext = { ...node.parsedContext }
  delete clonedParsedContext.id
  return {
    namespace: node.namespace,
    contextType: node.contextType,
    id: node.id,
    parsedContext: clonedParsedContext,
    parentNode: node.parentNode ? cloneContextSubtree(node.parentNode) : null,
  }
}

main().catch(console.error)
