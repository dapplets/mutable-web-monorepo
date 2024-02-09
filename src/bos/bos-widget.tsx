import { Widget } from "near-social-vm";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { StyleSheetManager } from "styled-components";

const EventsToStopPropagation = ["click", "keydown", "keyup", "keypress"];

export class BosComponent extends HTMLElement {
  private _adapterStylesMountPoint = document.createElement("style");
  private _stylesMountPoint = document.createElement("div");
  private _componentMountPoint = document.createElement("div");
  private _root = createRoot(this._componentMountPoint);

  #src: string = "";
  #props: any = {};

  set src(val: string) {
    this.#src = val;
    // this.setAttribute("data-component", val); // For debugging
    this._render();
  }

  get src() {
    return this.#src;
  }

  set props(val: any) {
    this.#props = val;
    // this.setAttribute("data-props", JSON.stringify(val)); // For debugging
    this._render();
  }

  get props() {
    return this.#props;
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "closed" });

    // Prevent event propagation from BOS-component to parent
    EventsToStopPropagation.forEach((eventName) => {
      this.addEventListener(eventName, (e) => e.stopPropagation());
    });

    shadowRoot.appendChild(this._componentMountPoint);
    shadowRoot.appendChild(this._stylesMountPoint);

    // It will prevent inheritance without affecting other CSS defined within the ShadowDOM.
    // https://stackoverflow.com/a/68062098
    const resetCssRules = `
      :host { 
        all: initial; 
        display: flex; 
        align-items: center;
        justify-content: center;
        position: relative;
      }
    `;
    this._adapterStylesMountPoint.innerHTML = resetCssRules;
    shadowRoot.appendChild(this._adapterStylesMountPoint);

    // For full-width components
    this._componentMountPoint.style.flex = "1";

    // Initial render
    this._render();
  }

  disconnectedCallback() {
    this._root.unmount();
  }

  _render() {
    this._root.render(
      <StyleSheetManager target={this._stylesMountPoint}>
        <Widget src={this.#src} props={this.#props} />
      </StyleSheetManager>
    );
  }
}
