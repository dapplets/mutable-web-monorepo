import { IAdapter, InsertionType } from "./core/adapters/interface";
import { BosParser } from "./core/parsers/bos-parser";
import { JsonParser, ParserConfig } from "./core/parsers/json-parser";
import { MicrodataParser } from "./core/parsers/microdata-parser";
import { DynamicHtmlAdapter } from "./core/adapters/dynamic-html-adapter";
import {
  ContextChangedDetails,
  ContextObserver,
  IContextCallbacks,
} from "./core/context-observer";
import { BosWidgetFactory } from "./bos/bos-widget-factory";
import { ILinkProvider } from "./providers/link-provider";
import { SocialDbLinkProvider } from "./providers/social-db-link-provider";
import { WalletSelector } from "@near-wallet-selector/core";
import { getNearConfig } from "./constants";
import { NearSigner } from "./providers/near-signer";
import { SocialDbParserConfigProvider } from "./providers/social-db-parser-config-provider";
import { IParserConfigProvider } from "./providers/parser-config-provider";
import { Context } from "./core/types";

export enum AdapterType {
  Bos = "bos",
  Microdata = "microdata",
  Json = "json",
}

export type EngineConfig = {
  networkId: string;
  selector: Promise<WalletSelector>;
};

const activatedParserConfigs = [
  "https://dapplets.org/ns/json/dapplets.near/parser/near-social-viewer",
  "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
];

const ContextActionsGroupSrc = "dapplets.near/widget/ContextActionsGroup";

export class Engine implements IContextCallbacks {
  adapters: Set<IAdapter> = new Set();
  document: XMLDocument = document.implementation.createDocument(
    null,
    "semantictree"
  );

  #contextObserver = new ContextObserver(this);
  #linkProvider: ILinkProvider | null = null;
  #parserConfigProvider: IParserConfigProvider | null = null;
  #bosWidgetFactory: BosWidgetFactory;
  #selector: WalletSelector | null = null;

  #contextActionGroups: WeakMap<Context, Element> = new WeakMap();

  constructor(private config: EngineConfig) {
    this.#bosWidgetFactory = new BosWidgetFactory({
      networkId: config.networkId,
      selector: config.selector,
      nodeName: "bos-component",
    });
  }

  handleContextStarted(context: Element): void {
    this.#linkProvider!.getLinksForContext(context)
      .then((links) => {
        for (const link of links) {
          // ToDo: do not concatenate namespaces
          const adapter = Array.from(this.adapters.values()).find(
            (adapter) => adapter.namespace === link.namespace
          );

          if (!adapter) return;

          const element = this.#bosWidgetFactory.createWidget(link.component);

          element.props = {
            // ToDo: implement context forwarding
            // context: extractParsedContext(context),
            accountGId: "MrConCreator/twitter",
            itemGId: "tweet/1694995203663290832",
          };

          // ToDo: generalize layout managers for insertion points at the core level
          // Generic insertion point for all contexts
          if (link.insertionPoint === "root") {
            if (!this.#contextActionGroups.has(context)) {
              const groupElement = this.#bosWidgetFactory.createWidget(
                ContextActionsGroupSrc
              );
              this.#contextActionGroups.set(context, groupElement);

              adapter.injectElement(
                groupElement,
                context,
                link.insertionPoint,
                link.insertionType as InsertionType
              );
            }

            const groupElement = this.#contextActionGroups.get(context)!;
            groupElement.appendChild(element);
          } else {
            adapter.injectElement(
              element,
              context,
              link.insertionPoint,
              link.insertionType as InsertionType
            );
          }
        }
      })
      .catch((err) => console.error(err));
  }

  handleContextChanged(context: Element, details: ContextChangedDetails): void {
    if (
      details.attributeName === "id" &&
      details.oldValue === null &&
      context.id !== details.oldValue
    ) {
      this.handleContextStarted(context);
    }
  }

  handleContextFinished(context: Element): void {
    // console.log("contextfinished", context);
  }

  async start(): Promise<void> {
    const nearConfig = getNearConfig(this.config.networkId);
    this.#selector = await this.config.selector;
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

    this.#contextObserver.observe(this.document.documentElement);
    adaptersToActivate.forEach((adapter) => this.registerAdapter(adapter));
  }

  stop() {
    this.#selector = null;
    this.#linkProvider = null;
    this.#contextObserver.disconnect();
    this.adapters.forEach((adapter) => this.unregisterAdapter(adapter));
  }

  registerAdapter(adapter: IAdapter) {
    this.document.documentElement.appendChild(adapter.context);
    this.adapters.add(adapter);
    adapter.start();
  }

  unregisterAdapter(adapter: IAdapter) {
    adapter.stop();
    this.document.documentElement.removeChild(adapter.context);
    this.adapters.delete(adapter);
  }

  getSerializedXmlTree(): string {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(this.document);
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
          this.document,
          "https://dapplets.org/ns/bos",
          new BosParser()
        );

      case AdapterType.Microdata:
        return new DynamicHtmlAdapter(
          observingElement,
          this.document,
          "https://dapplets.org/ns/microdata",
          new MicrodataParser()
        );

      case AdapterType.Json:
        if (!config?.namespace) {
          throw new Error("Json adapter requires id");
        }

        return new DynamicHtmlAdapter(
          observingElement,
          this.document,
          config.namespace,
          new JsonParser(config) // ToDo: add try catch because config can be invalid
        );

      default:
        throw new Error("Incompatible adapter type");
    }
  }
}
