import { IAdapter } from "./core/adapters/interface";
import { BosParser } from "./core/parsers/bos-parser";
import { JsonParser } from "./core/parsers/json-parser";
import { MicrodataParser } from "./core/parsers/microdata-parser";
import { DynamicHtmlAdapter } from "./core/adapters/dynamic-html-adapter";
import { BosWidgetFactory } from "./bos/bos-widget-factory";
import { IProvider, Mutation } from "./providers/provider";
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
import { MutationManager } from "./mutation-manager";

export enum AdapterType {
  Bos = "bos",
  Microdata = "microdata",
  Json = "json",
}

export type EngineConfig = {
  networkId: string;
  selector: WalletSelector;
};

const DefaultMutationId = "bos.dapplets.near/mutation/Sandbox";

export class Engine implements IContextListener {
  #provider: IProvider;
  #bosWidgetFactory: BosWidgetFactory;
  #selector: WalletSelector;
  #contextManagers: Map<IContextNode, ContextManager> = new Map();
  #mutationManager: MutationManager;

  adapters: Set<IAdapter> = new Set();
  treeBuilder: ITreeBuilder | null = null;
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
    this.#mutationManager = new MutationManager(this.#provider);
  }

  async handleContextStarted(context: IContextNode): Promise<void> {
    // if (!this.started) return;
    if (!context.id) return;

    // We don't wait adapters here
    // Find and load adapters for the given context
    this.#provider
      .getParserConfigsForContext({
        namespace: context.namespaceURI,
        contextType: context.tagName,
        contextId: context.id,
      })
      .then((configs) => {
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
      });

    // ToDo: do not iterate over all adapters
    const adapter = Array.from(this.adapters).find((adapter) => {
      return adapter.getInsertionPoints(context).length > 0;
    });

    if (!adapter) return;

    const contextManager = new ContextManager(
      context,
      adapter,
      this.#bosWidgetFactory,
      this.#mutationManager
    );

    this.#contextManagers.set(context, contextManager);

    const [links, apps] = await Promise.all([
      this.#mutationManager.getLinksForContext(context),
      this.#mutationManager.filterSuitableApps(context),
    ]);

    links.forEach((link) => contextManager.addUserLink(link));
    apps.forEach((app) => contextManager.addAppMetadata(app));
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

  handleInsPointStarted(context: IContextNode, newInsPoint: string): void {
    this.#contextManagers.get(context)?.injectLayoutManager(newInsPoint);
  }

  handleInsPointFinished(context: IContextNode, oldInsPoint: string): void {
    // ToDo: do nothing because IP unmounted?
  }

  async start(mutationId = DefaultMutationId): Promise<void> {
    // load mutation and apps
    await this.#mutationManager.switchMutation(mutationId);

    this.started = true;
    this.treeBuilder = new PureTreeBuilder(this);

    // ToDo: instantiate root context with data initially
    // ToDo: looks like circular dependency
    this.treeBuilder.updateParsedContext(this.treeBuilder.root, {
      id: window.location.hostname,
      // ToDo: add mutationId
    });

    console.log("Mutable Web Engine started!", {
      engine: this,
      provider: this.#provider,
    });
  }

  stop() {
    this.started = false;
    this.adapters.forEach((adapter) => this.unregisterAdapter(adapter));
    this.#contextManagers.forEach((cm) => cm.destroy());
    this.adapters.clear();
    this.#contextManagers.clear();
    this.treeBuilder = null;
  }

  async getMutations(): Promise<Mutation[]> {
    return this.#provider.getMutations();
  }

  async switchMutation(mutationId: string): Promise<void> {
    this.stop();
    await this.start(mutationId);
  }

  async getCurrentMutation(): Promise<Mutation | null> {
    return this.#mutationManager?.mutation ?? null;
  }

  registerAdapter(adapter: IAdapter) {
    if (!this.treeBuilder) throw new Error("Tree builder is not inited");
    this.treeBuilder.appendChild(this.treeBuilder.root, adapter.context);
    this.adapters.add(adapter);
    adapter.start();
  }

  unregisterAdapter(adapter: IAdapter) {
    if (!this.treeBuilder) throw new Error("Tree builder is not inited");
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
    if (!this.treeBuilder) throw new Error("Tree builder is not inited");

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
