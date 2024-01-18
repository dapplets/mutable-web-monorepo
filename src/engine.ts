import { IAdapter } from "./core/adapters/interface";
import { BosParser } from "./core/parsers/bos-parser";
import { JsonParser, ParserConfig } from "./core/parsers/json-parser";
import { MicrodataParser } from "./core/parsers/microdata-parser";
import { DynamicHtmlAdapter } from "./core/adapters/dynamic-html-adapter";
import { BosWidgetFactory } from "./bos/bos-widget-factory";
import { IProvider } from "./providers/provider";
import { WalletSelector } from "@near-wallet-selector/core";
import { getNearConfig } from "./constants";
import { NearSigner } from "./providers/near-signer";
import { SocialDbProvider } from "./providers/social-db-provider";
import {
  IContextListener,
  IContextNode,
  ITreeBuilder,
} from "./core/tree/types";
import { PureTreeBuilder } from "./core/tree/pure-tree/pure-tree-builder";
import { ContextManager } from "./context-manager";

export enum AdapterType {
  Bos = "bos",
  Microdata = "microdata",
  Json = "json",
}

export type EngineConfig = {
  networkId: string;
  selector: WalletSelector;
};

const activatedParserConfigs = [
  // "https://dapplets.org/ns/json/bos.dapplets.near/parser/near-social-viewer",
  "https://dapplets.org/ns/json/bos.dapplets.near/parser/twitter",
];

export class Engine implements IContextListener {
  #provider: IProvider;
  #bosWidgetFactory: BosWidgetFactory;
  #selector: WalletSelector;
  #contextManagers: WeakMap<IContextNode, ContextManager> = new WeakMap();

  adapters: Set<IAdapter> = new Set();
  treeBuilder: ITreeBuilder = new PureTreeBuilder(this); //new DomTreeBuilder(this);
  started: boolean = false;

  constructor(private config: EngineConfig) {
    this.#bosWidgetFactory = new BosWidgetFactory({
      networkId: this.config.networkId,
      selector: this.config.selector,
      tagName: "bos-component",
    });
    const nearConfig = getNearConfig(this.config.networkId);
    this.#selector = this.config.selector;
    const nearSigner = new NearSigner(this.#selector, nearConfig.nodeUrl);
    this.#provider = new SocialDbProvider(nearSigner, nearConfig.contractName);
    console.log(this.#provider);
  }

  async handleContextStarted(context: IContextNode): Promise<void> {
    if (!this.started) return;
    if (!context.id) return;

    // ToDo: do not iterate over all adapters
    const adapter = Array.from(this.adapters).find((adapter) => {
      return adapter.getInsertionPoints(context).length > 0;
    });

    if (!adapter) return;

    const contextManager = new ContextManager(
      context,
      adapter,
      this.#bosWidgetFactory,
      this.#provider
    );

    this.#contextManagers.set(context, contextManager);

    contextManager.injectLayoutManagers();

    const links = await this.#provider.getLinksForContext(context);

    links.forEach((link) => contextManager.addUserLink(link));
  }

  handleContextChanged(context: IContextNode, oldParsedContext: any): void {
    if (!this.started) return;

    this.#contextManagers.get(context)?.forceUpdate();
  }

  handleContextFinished(context: IContextNode): void {
    if (!this.started) return;

    // ToDo: will layout managers be removed from the DOM?
    this.#contextManagers.delete(context);
  }

  async start(): Promise<void> {
    this.started = true;

    const adaptersToActivate = [];

    // Adapters enabled by default
    adaptersToActivate.push(this.createAdapter(AdapterType.Bos));
    adaptersToActivate.push(this.createAdapter(AdapterType.Microdata));

    for (const configId of activatedParserConfigs) {
      const config = await this.#provider.getParserConfig(configId);

      if (config) {
        const adapter = this.createAdapter(AdapterType.Json, config);
        adaptersToActivate.push(adapter);
      }
    }

    adaptersToActivate.forEach((adapter) => this.registerAdapter(adapter));
  }

  stop() {
    this.started = false;
    this.adapters.forEach((adapter) => this.unregisterAdapter(adapter));
  }

  registerAdapter(adapter: IAdapter) {
    this.treeBuilder.appendChild(this.treeBuilder.root, adapter.context);
    this.adapters.add(adapter);
    adapter.start();
  }

  unregisterAdapter(adapter: IAdapter) {
    adapter.stop();
    this.treeBuilder.removeChild(this.treeBuilder.root, adapter.context);
    this.adapters.delete(adapter);
  }

  createAdapter(type: AdapterType.Microdata): IAdapter;
  createAdapter(type: AdapterType.Bos): IAdapter;
  createAdapter(type: AdapterType.Json, config: ParserConfig): IAdapter;
  createAdapter(type: AdapterType, config?: ParserConfig): IAdapter {
    const observingElement = document.body;

    switch (type) {
      case AdapterType.Bos:
        return new DynamicHtmlAdapter(
          observingElement,
          this.treeBuilder,
          "https://dapplets.org/ns/bos",
          new BosParser()
        );

      case AdapterType.Microdata:
        return new DynamicHtmlAdapter(
          observingElement,
          this.treeBuilder,
          "https://dapplets.org/ns/microdata",
          new MicrodataParser()
        );

      case AdapterType.Json:
        if (!config?.namespace) {
          throw new Error("Json adapter requires id");
        }

        return new DynamicHtmlAdapter(
          observingElement,
          this.treeBuilder,
          config.namespace,
          new JsonParser(config) // ToDo: add try catch because config can be invalid
        );

      default:
        throw new Error("Incompatible adapter type");
    }
  }
}
