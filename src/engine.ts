import { IAdapter, InsertionType } from "./adapters/interface";
import { BosParser } from "./parsers/bos-parser";
import {
  JsonParser,
  JsonParserConfig,
  ParserConfig,
} from "./parsers/json-parser";
import { MicrodataParser } from "./parsers/microdata-parser";
import { DynamicHtmlAdapter } from "./adapters/dynamic-html-adapter";
import {
  ContextChangedDetails,
  ContextObserver,
  IContextCallbacks,
} from "./context-observer";
import { LinkProvider } from "./providers/link-provider";
import { ParserConfigProvider } from "./providers/parser-config-provider";

export enum AdapterType {
  Bos = "bos",
  Microdata = "microdata",
  Json = "json",
}

export type EngineConfig = {
  jsonParserConfigs: ParserConfig[];
};

const activatedParserConfigs = [
  "dapplets.near/parser/near-social-viewer",
  "dapplets.near/parser/twitter",
];

export class Engine implements IContextCallbacks {
  adapters: Set<IAdapter> = new Set();
  document: XMLDocument = document.implementation.createDocument(
    null,
    "semantictree"
  );

  #contextObserver = new ContextObserver(this);
  #linkProvider = new LinkProvider();
  #parserConfigProvider = new ParserConfigProvider();

  constructor(config: Partial<EngineConfig> = {}) {}

  handleContextStarted(context: Element): void {
    this.#linkProvider
      .getLinksForContext(context)
      .then((links) => {
        for (const link of links) {
          // ToDo: do not concatenate namespaces
          const adapter = Array.from(this.adapters.values()).find(
            (adapter) =>
              adapter.namespace ===
              "https://dapplets.org/ns/json/" + link.parserConfigId
          );

          if (!adapter) return;

          const element = document.createElement("button");
          element.innerText = link.component;
          element.addEventListener("click", () => {
            const obj = Array.from(context.attributes)
              .map((a) => [a.name, a.value])
              .reduce((acc, attr) => {
                // @ts-ignore
                acc[attr[0]] = attr[1];
                return acc;
              }, {});
            alert(JSON.stringify(obj, null, 2));
          });

          adapter.injectElement(
            element,
            context,
            link.insertionPoint,
            link.insertionType as InsertionType
          );
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
    const adaptersToActivate = [];

    // Adapters enabled by default
    adaptersToActivate.push(this.createAdapter(AdapterType.Bos));
    adaptersToActivate.push(this.createAdapter(AdapterType.Microdata));

    for (const configId of activatedParserConfigs) {
      const config = await this.#parserConfigProvider.getParserConfig(configId);

      if (config) {
        const adapter = this.createAdapter(AdapterType.Json, {
          namespace: configId,
          parserConfig: config,
        });
        adaptersToActivate.push(adapter);
      }
    }

    this.#contextObserver.observe(this.document.documentElement);
    adaptersToActivate.forEach((adapter) => this.registerAdapter(adapter));
  }

  stop() {
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
  createAdapter(type: AdapterType.Json, config: JsonParserConfig): IAdapter;
  createAdapter(type: AdapterType, config?: JsonParserConfig): IAdapter {
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
          "https://dapplets.org/ns/json/" + config.namespace,
          new JsonParser(config?.parserConfig) // ToDo: add try catch because config can be invalid
        );

      default:
        throw new Error("Incompatible adapter type");
    }
  }
}
