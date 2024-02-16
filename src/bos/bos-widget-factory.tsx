import { BosComponent } from './bos-widget'

export type BosWidgetFactoryConfig = {
  networkId: string
  selector: any
  tagName: string
}

export class BosWidgetFactory {
  private _tagName: string

  constructor(config: BosWidgetFactoryConfig) {
    this._tagName = config.tagName

    const ExtendedBosComponent = class extends BosComponent {}

    customElements.define(this._tagName, ExtendedBosComponent)
  }

  createWidget(src: string) {
    const element = document.createElement(this._tagName) as BosComponent
    element.src = src
    return element
  }
}
