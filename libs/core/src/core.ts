import { PureTreeBuilder } from './tree/pure-tree/pure-tree-builder'
import { IAdapter } from './adapters/interface'
import { DynamicHtmlAdapter } from './adapters/dynamic-html-adapter'
import { JsonParser } from './parsers/json-parser'
import { BosParser } from './parsers/bos-parser'
import { MutableWebParser } from './parsers/mweb-parser'
import { AdapterType, ParserConfig } from './types'

export class Core {
  private _treeBuilder: PureTreeBuilder

  private adapters = new Map<string, IAdapter>()

  public get tree() {
    return this._treeBuilder.root
  }

  constructor() {
    this._treeBuilder = new PureTreeBuilder()
  }

  public attachParserConfig(parserConfig: ParserConfig) {
    const adapter = this._createAdapter(parserConfig)
    this._registerAdapter(adapter)
  }

  public detachParserConfig(namespace: string) {
    const adapter = this.adapters.get(namespace)
    if (!adapter) return
    this._unregisterAdapter(adapter)
  }

  /**
   * @deprecated
   */
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
    console.log(`[MutableWeb] Loaded parser: ${adapter.namespace}`)
  }

  private _unregisterAdapter(adapter: IAdapter) {
    if (!this._treeBuilder) throw new Error('Tree builder is not inited')
    adapter.stop()
    this._treeBuilder.removeChild(this._treeBuilder.root, adapter.context)
    this.adapters.delete(adapter.namespace)
    console.log(`[MutableWeb] Unloaded parser: ${adapter.namespace}`)
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
