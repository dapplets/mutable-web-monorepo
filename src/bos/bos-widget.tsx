import * as React from 'react'
import { Widget } from 'near-social-vm'
import { StyleSheetManager } from 'styled-components'
import { createRoot } from 'react-dom/client'

const EventsToStopPropagation = ['click', 'keydown', 'keyup', 'keypress']

export class BosComponent extends HTMLElement {
  private _shadowRoot = this.attachShadow({ mode: 'closed' })
  private _styleLibraryMountPoint = document.createElement('link')
  private _adapterStylesMountPoint = document.createElement('style')
  private _stylesMountPoint = document.createElement('div')
  private _componentMountPoint = document.createElement('div')
  private _root = createRoot(this._componentMountPoint)

  #src: string = ''
  #props: any = {}
  #redirectMap: any = null

  set src(val: string) {
    this.#src = val
    // this.setAttribute("data-component", val); // For debugging
    this._render()
  }

  get src() {
    return this.#src
  }

  set styleSrc(val: string | null) {
    if (!val) {
      this._styleLibraryMountPoint.remove()
    } else {
      this._styleLibraryMountPoint.href = val

      if (!this._styleLibraryMountPoint.parentElement) {
        this._shadowRoot.appendChild(this._styleLibraryMountPoint)
      }
    }
  }

  get styleSrc() {
    return this._styleLibraryMountPoint.parentElement ? this._styleLibraryMountPoint.href : null
  }

  set props(val: any) {
    this.#props = val
    // this.setAttribute("data-props", JSON.stringify(val)); // For debugging
    this._render()
  }

  get props() {
    return this.#props
  }

  set redirectMap(val: any) {
    if (this.#redirectMap === val) return

    this.#redirectMap = val
    this._render()
  }

  get redirectMap() {
    return this.#redirectMap
  }

  connectedCallback() {
    // Prevent event propagation from BOS-component to parent
    EventsToStopPropagation.forEach((eventName) => {
      this.addEventListener(eventName, (e) => e.stopPropagation())
    })

    this._shadowRoot.appendChild(this._componentMountPoint)
    this._shadowRoot.appendChild(this._stylesMountPoint)

    // It will prevent inheritance without affecting other CSS defined within the ShadowDOM.
    // https://stackoverflow.com/a/68062098
    const resetCssRules = `
      :host { 
        all: initial; 
        display: flex; 
        align-items: center;
        justify-content: center;
        position: relative;
        visibility: visible !important;
      }
    `
    this._adapterStylesMountPoint.innerHTML = resetCssRules
    this._shadowRoot.appendChild(this._adapterStylesMountPoint)

    // For external bootstrap styles
    this._styleLibraryMountPoint.rel = 'stylesheet'
    this._shadowRoot.appendChild(this._styleLibraryMountPoint)
    this._componentMountPoint.setAttribute('data-bs-theme', 'light')

    // For full-width components
    this._componentMountPoint.style.flex = '1'

    // Initial render
    this._render()
  }

  disconnectedCallback() {
    this._root.unmount()
  }

  _render() {
    this._root.render(
      <StyleSheetManager target={this._stylesMountPoint}>
        <Widget
          src={this.#src}
          props={this.#props}
          config={{ redirectMap: this.#redirectMap }}
          loading={<></>}
        />
      </StyleSheetManager>
    )
  }
}
