import { IAdapter } from "./adapters/interface";
import { BosAdapter } from "./adapters/bos-adapter";
import { JsonAdapter, AdapterConfig } from "./adapters/json-adapter";
import { MicrodataAdapter } from "./adapters/microdata-adapter";
import { ContextNode } from "./context-node";

class SemNode {
  children: SemNode[] = [];
  parent: SemNode | null = null;
  contexts: ContextNode[] = [];

  addChild(node: SemNode) {
    node.parent = this;
    this.children.push(node);
  }

  removeChild(node: SemNode) {
    this.children.splice(this.children.indexOf(node), 1);
  }

  // ToDo: addContext, removeContext ?
}

export type EngineConfig = {
  jsonAdapterConfigs: AdapterConfig[];
};

export class Engine {
  adapters: IAdapter[];

  constructor(config: Partial<EngineConfig> = {}) {
    const targetElement = document.body;

    this.adapters = [
      new BosAdapter(targetElement),
      new MicrodataAdapter(targetElement),
    ];

    for (const adapterConfig of config.jsonAdapterConfigs ?? []) {
      this.adapters.push(new JsonAdapter(targetElement, adapterConfig));
    }
  }

  start() {
    this.adapters.forEach((adapter) => adapter.start());
  }

  stop() {
    this.adapters.forEach((adapter) => adapter.stop());
  }
}
