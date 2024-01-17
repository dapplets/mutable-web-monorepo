import { IAdapter, InsertionType } from "./core/adapters/interface";
import { BosParser } from "./core/parsers/bos-parser";
import { JsonParser, ParserConfig } from "./core/parsers/json-parser";
import { MicrodataParser } from "./core/parsers/microdata-parser";
import { DynamicHtmlAdapter } from "./core/adapters/dynamic-html-adapter";
import { BosWidgetFactory } from "./bos/bos-widget-factory";
import { BosUserLink, IProvider } from "./providers/provider";
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
  // "https://dapplets.org/ns/json/bos.dapplets.near/parser/near-social-viewer",
  "https://dapplets.org/ns/json/bos.dapplets.near/parser/twitter",
];

const DefaultLayoutManager = "bos.dapplets.near/widget/DefaultLayoutManager";
const DefaultInsertionType: InsertionType = InsertionType.Inside;

export class Engine implements IContextListener {
  #provider: IProvider;
  #bosWidgetFactory: BosWidgetFactory;
  #selector: WalletSelector;
  #elementsByContext: WeakMap<IContextNode, Map<string, BosComponent>> =
    new WeakMap();

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

    const links = await this.#provider.getLinksForContext(context);

    // ToDo: don't iterate over all adapters
    for (const adapter of this.adapters) {
      const insertionPoints = adapter.getInsertionPoints(context);

      // Insert layout manager to every insertion point
      for (const insPoint of insertionPoints) {
        const bosWidgetId = insPoint.bosLayoutManager ?? DefaultLayoutManager;
        const insertionType = insPoint.insertionType ?? DefaultInsertionType;
        const layoutManagerElement =
          this.#bosWidgetFactory.createWidget(bosWidgetId);

        const suitableLinks = links.filter(
          (link) => link.insertionPoint === insPoint.name
        );

        layoutManagerElement.props = {
          // ToDo: unify context forwarding
          context: context.parsedContext,
          contextType: context.tagName,
          widgets: suitableLinks.map((link) => ({
            src: link.component,
            props: {
              context: context.parsedContext,
            }, // ToDo: add props
          })),
          injectWidget: (bosWidgetId: string) =>
            this._createUserLink(bosWidgetId, context),
        };

        try {
          // Inject layout manager
          adapter.injectElement(
            layoutManagerElement,
            context,
            insPoint.name,
            insertionType
          );

          if (!this.#elementsByContext.has(context)) {
            this.#elementsByContext.set(context, new Map());
          }

          this.#elementsByContext
            .get(context)!
            .set(insPoint.name, layoutManagerElement);
        } catch (err) {
          console.error(err);
        }
      }
    }

    // ToDo: update #elementsByContext map
  }

  handleContextChanged(context: IContextNode, oldParsedContext: any): void {
    if (!this.started) return;
    this.#elementsByContext.get(context)?.forEach((element) => {
      element.props = {
        ...element.props,
        // ToDo: unify context forwarding
        context: context.parsedContext, // for web2
        // ...context.parsedContext, // for bos gateways
      };
    });
  }

  handleContextFinished(context: IContextNode): void {
    if (!this.started) return;
    this.#elementsByContext.get(context)?.forEach((element) => {
      element.remove();
    });
  }

  async _createUserLink(bosWidgetId: string, context: IContextNode) {
    // ToDo: fetch metadata of the BOS component
    console.log({ bosWidgetId, context });

    const insertionPoint = "root";

    const newLink: Omit<BosUserLink, "id"> = {
      namespace: context.namespaceURI!,
      contextType: context.tagName,
      contextId: context.id,
      insertionPoint: insertionPoint,
      component: bosWidgetId,
    };

    await this.#provider.createLink(newLink);

    const layoutManager = this.#elementsByContext
      .get(context)
      ?.get(insertionPoint);

    // Add new widget to the layout manager
    if (layoutManager) {
      layoutManager.props = {
        ...layoutManager.props,
        widgets: [
          ...layoutManager.props.widgets,
          { src: bosWidgetId, props: {} },
        ],
      };
    }
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
