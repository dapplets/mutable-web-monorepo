import { IAdapter, InsertionType } from "./core/adapters/interface";
import { BosParser } from "./core/parsers/bos-parser";
import { JsonParser, ParserConfig } from "./core/parsers/json-parser";
import { MicrodataParser } from "./core/parsers/microdata-parser";
import { DynamicHtmlAdapter } from "./core/adapters/dynamic-html-adapter";
import { BosWidgetFactory } from "./bos/bos-widget-factory";
import { BosUserLink, ILinkProvider } from "./providers/link-provider";
import { SocialDbLinkProvider } from "./providers/social-db-link-provider";
import { WalletSelector } from "@near-wallet-selector/core";
import { getNearConfig } from "./constants";
import { NearSigner } from "./providers/near-signer";
import { SocialDbParserConfigProvider } from "./providers/social-db-parser-config-provider";
import { IParserConfigProvider } from "./providers/parser-config-provider";
import {
  IContextListener,
  IContextNode,
  ITreeBuilder,
} from "./core/tree/types";
import { DomTreeBuilder } from "./core/tree/dom-tree/dom-tree-builder";
import { PureTreeBuilder } from "./core/tree/pure-tree/pure-tree-builder";
import { BosComponent } from "./bos/bos-widget";

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
  "https://dapplets.org/ns/json/dapplets.near/parser/near-social-viewer",
  "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
];

const ContextActionsGroupSrc = "bos.dapplets.near/widget/ContextActionsGroup";

export class Engine implements IContextListener {
  #linkProvider: ILinkProvider;
  #parserConfigProvider: IParserConfigProvider;
  #bosWidgetFactory: BosWidgetFactory;
  #selector: WalletSelector;
  #contextActionGroups: WeakMap<IContextNode, BosComponent> = new WeakMap();
  #elementsByContext: WeakMap<IContextNode, Set<BosComponent>> = new WeakMap();

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
    this.#linkProvider = new SocialDbLinkProvider(
      nearSigner,
      nearConfig.contractName
    );
    this.#parserConfigProvider = new SocialDbParserConfigProvider(
      nearSigner,
      nearConfig.contractName
    );
    console.log(this.#parserConfigProvider);
    console.log(this.#linkProvider);
  }

  handleContextStarted(context: IContextNode): void {
    if (!this.started) return;

    this.#linkProvider!.getLinksForContext(context)
      .then((links) => {
        for (const link of links) {
          this._processUserLink(context, link);
        }
      })
      .catch((err) => console.error(err));
  }

  handleContextChanged(context: IContextNode, oldParsedContext: any): void {
    if (!this.started) return;
    this.#elementsByContext.get(context)?.forEach((element) => {
      element.props = {
        ...element.props,
        // ToDo: unify context forwarding
        context: context.parsedContext, // for web2
        ...context.parsedContext, // for bos gateways
      };
    });
  }

  handleContextFinished(context: IContextNode): void {
    if (!this.started) return;
    this.#elementsByContext.get(context)?.forEach((element) => {
      element.remove();
    });
  }

  _processUserLink(context: IContextNode, link: BosUserLink) {
    // ToDo: do not concatenate namespaces
    const adapter = Array.from(this.adapters.values()).find(
      (adapter) => adapter.namespace === link.namespace
    );

    if (!adapter) return;

    const element = this.#bosWidgetFactory.createWidget(link.component);

    // ToDo: extract to separate method and currify
    const createUserLink = async (linkFromBos: Partial<BosUserLink>) => {
      const {
        namespace,
        contextType,
        contextId,
        insertionPoint,
        insertionType,
        component,
      } = linkFromBos;

      const newLink: BosUserLink = {
        namespace: namespace !== undefined ? namespace : link.namespace,
        contextType: contextType !== undefined ? contextType : link.contextType,
        contextId: contextId !== undefined ? contextId : context.id,
        insertionPoint: insertionPoint!,
        insertionType: insertionType!,
        component: component!,
      };

      await this.#linkProvider!.createLink(newLink);

      this._processUserLink(context, newLink);
    };

    element.props = {
      // ToDo: rerender component on context change
      createUserLink,
      // ToDo: unify context forwarding
      context: context.parsedContext, // for web2
      ...context.parsedContext, // for bos gateways
    };

    // ToDo: generalize layout managers for insertion points at the core level
    // Generic insertion point for all contexts
    if (link.insertionPoint === "root" && link.insertionType === "inside") {
      if (!this.#contextActionGroups.has(context)) {
        const groupElement = this.#bosWidgetFactory.createWidget(
          ContextActionsGroupSrc
        );
        this.#contextActionGroups.set(context, groupElement);

        adapter.injectElement(
          groupElement,
          context,
          link.insertionPoint,
          InsertionType.Before
        );
      }

      const groupElement = this.#contextActionGroups.get(context)!;
      groupElement.appendChild(element);
    } else {
      try {
        adapter.injectElement(
          element,
          context,
          link.insertionPoint,
          link.insertionType as InsertionType
        );
      } catch (err) {
        console.error(err);
      }
    }

    if (!this.#elementsByContext.has(context)) {
      this.#elementsByContext.set(context, new Set());
    }

    this.#elementsByContext.get(context)!.add(element);
  }

  async start(): Promise<void> {
    this.started = true;

    const adaptersToActivate = [];

    // Adapters enabled by default
    adaptersToActivate.push(this.createAdapter(AdapterType.Bos));
    adaptersToActivate.push(this.createAdapter(AdapterType.Microdata));

    for (const configId of activatedParserConfigs) {
      const config = await this.#parserConfigProvider.getParserConfig(configId);

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
