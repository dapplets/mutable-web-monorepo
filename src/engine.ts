import { IAdapter } from "./core/adapters/interface";
import { BosParser, BosParserConfig } from "./core/parsers/bos-parser";
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

export class Engine implements IContextListener {
  #provider: IProvider;
  #bosWidgetFactory: BosWidgetFactory;
  #selector: WalletSelector;
  #contextManagers: WeakMap<IContextNode, ContextManager> = new WeakMap();

  adapters: Set<IAdapter> = new Set();
  treeBuilder: ITreeBuilder;
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
    this.treeBuilder = new PureTreeBuilder(this);

    // ToDo: instantiate root context with data initially
    // ToDo: looks like circular dependency
    this.treeBuilder.updateParsedContext(this.treeBuilder.root, {
      id: window.location.hostname,
      // ToDo: add mutationId
    });
  }

  async handleContextStarted(context: IContextNode): Promise<void> {
    // if (!this.started) return;
    if (!context.id) return;

    // Find and load adapters for the given context
    // ToDo: parallelize
    const configs = await this.#provider.getParserConfigsForContext(context);
    for (const config of configs) {
      const type = this.getParserType(config.namespace);
      if (!type) {
        console.error("Unsupported parser namespace");
        continue;
      }
      const adapter = this.createAdapter(type, config);
      this.registerAdapter(adapter);

      console.log(`[MutableWeb] Loaded new adapter: ${adapter.namespace}`);
    }

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

    console.log("Mutable Web Engine started!", {
      engine: this,
      provider: this.#provider,
    });
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

  getParserType(ns: string): AdapterType | null {
    if (ns.startsWith("https://dapplets.org/ns/json")) {
      return AdapterType.Json;
    } else if (ns.startsWith("https://dapplets.org/ns/bos")) {
      return AdapterType.Bos;
    } else if (ns.startsWith("https://dapplets.org/ns/microdata")) {
      return AdapterType.Microdata;
    } else {
      return null;
    }
  }

  createAdapter(type: AdapterType, config?: any): IAdapter {
    const observingElement = document.body;

    switch (type) {
      case AdapterType.Bos:
        if (!config?.namespace) {
          throw new Error("Json adapter requires id");
        }

        return new DynamicHtmlAdapter(
          observingElement,
          this.treeBuilder,
          config.namespace,
          new BosParser(config)
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
