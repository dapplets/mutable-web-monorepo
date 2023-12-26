import { EthersProviderContext, Widget } from "near-social-vm";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { StyleSheetManager } from "styled-components";

export class BosComponent extends HTMLElement {
  public src: string = '';

  private _adapterStylesMountPoint = document.createElement("style");
  private _stylesMountPoint = document.createElement("div");
  private _componentMountPoint = document.createElement("div");
  private _root = createRoot(this._componentMountPoint);
  private _BosWidget: React.FC<{ src: string; props: any }>;

  constructor(useSingletonInitNear: () => void) {
    super();

    this._BosWidget = ({ src, props }: { src: string; props: any }) => {
      useSingletonInitNear();

      if (!EthersProviderContext.Provider) {
        return null;
      }

      return <Widget src={src} props={props} />;
    };
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "closed" });

    // Prevent propagation of clicks from BOS-component to parent
    this._componentMountPoint.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    shadowRoot.appendChild(this._componentMountPoint);
    shadowRoot.appendChild(this._stylesMountPoint);

    // It will prevent inheritance without affecting other CSS defined within the ShadowDOM.
    // https://stackoverflow.com/a/68062098
    const disableInheritanceRule = ":host { all: initial; } ";
    this._adapterStylesMountPoint.innerHTML = disableInheritanceRule;
    shadowRoot.appendChild(this._adapterStylesMountPoint);

    const { props } = this._getCustomProps();

    // ToDo: custom setter will be applied for initially declared properties only
    Object.keys(props).forEach((propName) => {
      // @ts-ignore
      this["_" + propName] = props[propName];
      Object.defineProperty(this, propName, {
        enumerable: true,
        // @ts-ignore
        get: () => this["_" + propName],
        set: (value) => {
          // @ts-ignore
          this["_" + propName] = value;

          this._render();
        },
      });
    });

    this._render();
  }

  disconnectedCallback() {
    this._root.unmount();
  }

  _getCustomProps(): { src: string; props: any } {
    const { src, ...anotherProps } = this;

    const keysToSkip = ["__CE_state", "__CE_definition", "__CE_shadowRoot"];

    const props = Object.fromEntries(
      Object.keys(anotherProps)
        .filter((key) => !keysToSkip.includes(key) && !key.startsWith("_"))
        // @ts-ignore
        .map((key) => [key, anotherProps[key]])
    );

    return { src, props };
  }

  _render() {
    const { src, props } = this._getCustomProps();

    this._root.render(
      <StyleSheetManager target={this._stylesMountPoint}>
        <this._BosWidget src={src} props={props} />
      </StyleSheetManager>
    );
  }
}
