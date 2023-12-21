import { IAdapter, IHtmlParser } from "./adapters/interface";
import { BosAdapter } from "./adapters/bos-adapter";
import {
  JsonAdapter,
  JsonAdapterConfig,
  ParserConfig,
} from "./adapters/json-adapter";
import { MicrodataAdapter } from "./adapters/microdata-adapter";
import { DynamicHtmlAdapter } from "./adapters/dynamic-html-adapter";

export enum AdapterType {
  Bos = "bos",
  Microdata = "microdata",
  Json = "json",
}

export type EngineConfig = {
  jsonAdapterConfigs: ParserConfig[];
};

export class Engine {
  adapters: IAdapter[] = [];
  document: XMLDocument = document.implementation.createDocument(
    null,
    "semantictree"
  );

  constructor(config: Partial<EngineConfig> = {}) {
    this.attachAdapter(AdapterType.Bos);
    this.attachAdapter(AdapterType.Microdata);
    this.attachAdapter(AdapterType.Json, {
      namespace: "some-web-site",
      parserConfig: config.jsonAdapterConfigs![0],
    });
  }

  start() {
    this.adapters.forEach((adapter) => adapter.start());
  }

  stop() {
    this.adapters.forEach((adapter) => adapter.stop());
  }

  attachAdapter(type: AdapterType.Microdata): void;
  attachAdapter(type: AdapterType.Bos): void;
  attachAdapter(type: AdapterType.Json, config: JsonAdapterConfig): void;
  attachAdapter(type: AdapterType, config?: JsonAdapterConfig): void {
    const observingElement = document.body;

    let adapter: IAdapter;

    switch (type) {
      case AdapterType.Bos:
        adapter = new DynamicHtmlAdapter(
          observingElement,
          this.document,
          "https://dapplets.org/ns/bos",
          new BosAdapter()
        );
        break;

      case AdapterType.Microdata:
        adapter = new DynamicHtmlAdapter(
          observingElement,
          this.document,
          "https://dapplets.org/ns/microdata",
          new MicrodataAdapter()
        );
        break;

      case AdapterType.Json:
        if (!config?.namespace) {
          throw new Error("Json adapter requires id");
        }

        adapter = new DynamicHtmlAdapter(
          observingElement,
          this.document,
          "https://dapplets.org/ns/json/" + config.namespace,
          new JsonAdapter(config?.parserConfig)
        );
        break;

      default:
        throw new Error("Incompatible adapter type");
    }

    this.adapters.push(adapter);
  }
}
