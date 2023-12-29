import { BosComponent } from "./bos-widget";

export type BosWidgetFactoryConfig = {
  nodeName: string;
};

export class BosWidgetFactory {
  private _nodeName: string;

  constructor(config: BosWidgetFactoryConfig) {
    this._nodeName = config.nodeName;
    customElements.define(this._nodeName, BosComponent);
  }

  createWidget(src: string) {
    const element = document.createElement(this._nodeName) as BosComponent;
    element.src = src;
    return element;
  }
}
