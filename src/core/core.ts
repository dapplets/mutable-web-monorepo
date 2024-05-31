import { PureTreeBuilder } from './tree/pure-tree/pure-tree-builder'
import { IAdapter } from './adapters/interface'
import { DynamicHtmlAdapter } from './adapters/dynamic-html-adapter'
import { AdapterType } from '../engine/providers/provider'
import { JsonParser } from './parsers/json-parser'
import { BosParser } from './parsers/bos-parser'
import { MutableWebParser } from './parsers/mweb-parser'
import { ParserConfig } from './types'
import { CoreEvents } from './events'
import { EventEmitter, Subscription } from './event-emitter'

export interface CoreConfig {}

export class Core {
  private _eventEmitter: EventEmitter<CoreEvents>
  private _treeBuilder: PureTreeBuilder

  /**
   * @deprecated
   */
  public adapters = new Map<string, IAdapter>()

  public get tree() {
    return this._treeBuilder.root
  }

  constructor(config?: CoreConfig) {
    this._eventEmitter = new EventEmitter()
    this._treeBuilder = new PureTreeBuilder(this._eventEmitter)
  }

  public attachParserConfig(parserConfig: ParserConfig) {
    const adapter = this._createAdapter(parserConfig)
    this._registerAdapter(adapter)
  }

  public detachParserConfig(namespace: string) {
    const adapter = this.adapters.get(namespace)
    if (!adapter) throw new Error('Adapter is not registried')
    this._unregisterAdapter(adapter)
  }

  public on<EventName extends keyof CoreEvents>(
    eventName: EventName,
    callback: (event: CoreEvents[EventName]) => void
  ): Subscription {
    return this._eventEmitter.on(eventName, callback)
  }

  public off<EventName extends keyof CoreEvents>(
    eventName: EventName,
    callback: (event: CoreEvents[EventName]) => void
  ): void {
    return this._eventEmitter.off(eventName, callback)
  }

  public updateRootContext(rootParsedContext: any = {}) {
    this._treeBuilder.updateParsedContext(this._treeBuilder.root, {
      id: window.location.hostname,
      url: window.location.href,
      ...rootParsedContext,
    })
  }

  public clear() {
    this.adapters.forEach((adapter) => this._unregisterAdapter(adapter))
    this.adapters.clear()
    this._treeBuilder.clear()
  }

  private _registerAdapter(adapter: IAdapter) {
    if (!this._treeBuilder) throw new Error('Tree builder is not inited')
    this._treeBuilder.appendChild(this._treeBuilder.root, adapter.context)
    this.adapters.set(adapter.namespace, adapter)
    adapter.start()
    console.log(`[MutableWeb] Loaded new adapter: ${adapter.namespace}`)
  }

  private _unregisterAdapter(adapter: IAdapter) {
    if (!this._treeBuilder) throw new Error('Tree builder is not inited')
    adapter.stop()
    this._treeBuilder.removeChild(this._treeBuilder.root, adapter.context)
    this.adapters.delete(adapter.namespace)
  }

  private _createAdapter(config: ParserConfig): IAdapter {
    if (!this._treeBuilder) {
      throw new Error('Tree builder is not inited')
    }

    switch (config.parserType) {
      case AdapterType.Json:
        return new DynamicHtmlAdapter(
          document.documentElement,
          this._treeBuilder,
          config.id,
          new JsonParser(config) // ToDo: add try catch because config can be invalid
        )

      case AdapterType.Bos:
        return new DynamicHtmlAdapter(
          document.documentElement,
          this._treeBuilder,
          config.id,
          new BosParser(config)
        )

      case AdapterType.MWeb:
        return new DynamicHtmlAdapter(
          document.body,
          this._treeBuilder,
          config.id,
          new MutableWebParser()
        )

      default:
        throw new Error('Incompatible adapter type')
    }
  }
}
