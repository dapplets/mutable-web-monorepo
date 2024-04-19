import { BosComponent } from './bos-widget'

export type BosWidgetFactoryConfig = {
  tagName: string
  bosElementStyleSrc?: string
}

export class BosWidgetFactory {
  private _tagName: string
  private _styleSrc?: string

  constructor(config: BosWidgetFactoryConfig) {
    this._tagName = config.tagName
    this._styleSrc = config.bosElementStyleSrc

    const ExtendedBosComponent = class extends BosComponent {}

    customElements.define(this._tagName, ExtendedBosComponent)
  }

  createWidget(src: string) {
    const element = document.createElement(this._tagName) as BosComponent
    element.src = src
    element.styleSrc = this._styleSrc ?? null
    return element
  }
}
