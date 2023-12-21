import { IAdapter } from "./adapters/interface";
import { BosParser } from "./parsers/bos-parser";
import {
  JsonParser,
  JsonParserConfig,
  ParserConfig,
} from "./parsers/json-parser";
import { MicrodataParser } from "./parsers/microdata-parser";
import { DynamicHtmlAdapter } from "./adapters/dynamic-html-adapter";

export enum AdapterType {
  Bos = "bos",
  Microdata = "microdata",
  Json = "json",
}

export type EngineConfig = {
  JsonParserConfigs: ParserConfig[];
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
      parserConfig: config.JsonParserConfigs![0],
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
  attachAdapter(type: AdapterType.Json, config: JsonParserConfig): void;
  attachAdapter(type: AdapterType, config?: JsonParserConfig): void {
    const observingElement = document.body;

    let adapter: IAdapter;

    switch (type) {
      case AdapterType.Bos:
        adapter = new DynamicHtmlAdapter(
          observingElement,
          this.document,
          "https://dapplets.org/ns/bos",
          new BosParser()
        );
        break;

      case AdapterType.Microdata:
        adapter = new DynamicHtmlAdapter(
          observingElement,
          this.document,
          "https://dapplets.org/ns/microdata",
          new MicrodataParser()
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
          new JsonParser(config?.parserConfig)
        );
        break;

      default:
        throw new Error("Incompatible adapter type");
    }

    this.adapters.push(adapter);
  }
}
