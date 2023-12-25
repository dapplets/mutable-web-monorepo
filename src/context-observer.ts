import { Context } from "./types";

export type ContextChangedDetails = {
  attributeNamespace: string | null;
  attributeName: string | null;
  oldValue: string | null;
};

export interface IContextCallbacks {
  handleContextStarted(context: Context): void;
  handleContextChanged(context: Context, details: ContextChangedDetails): void;
  handleContextFinished(context: Context): void;
}

export class ContextObserver {
  #observer: MutationObserver;

  constructor(private callbacks: IContextCallbacks) {
    this.#observer = new MutationObserver(this.#handleMutations.bind(this));
  }

  #handleMutations(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const addedNode of mutation.addedNodes) {
          if (addedNode instanceof Element) {
            this.callbacks.handleContextStarted(addedNode);
          }
        }
        for (const removedNode of mutation.removedNodes) {
          if (removedNode instanceof Element) {
            this.callbacks.handleContextFinished(removedNode);
          }
        }
      } else if (mutation.type === "attributes") {
        if (mutation.target instanceof Element) {
          const details = {
            attributeNamespace: mutation.attributeNamespace,
            attributeName: mutation.attributeName,
            oldValue: mutation.oldValue,
          };
          this.callbacks.handleContextChanged(mutation.target, details);
        }
      }
    }
  }

  observe(context: Context) {
    this.#observer.observe(context, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  disconnect() {
    this.#observer.disconnect();
  }
}
