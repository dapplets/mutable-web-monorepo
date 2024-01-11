import { BosComponent } from "./bos-widget";

export type BosWidgetFactoryConfig = {
  tagName: string;
};

export class BosWidgetFactory {
  private _tagName: string;

  constructor(config: BosWidgetFactoryConfig) {
    this._tagName = config.tagName;
    customElements.define(this._tagName, BosComponent);
  }

  createWidget(src: string) {
    const element = document.createElement(this._tagName) as BosComponent;
    element.src = src;
    return element;
  }
}
