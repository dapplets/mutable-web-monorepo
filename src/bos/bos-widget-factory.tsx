import { useInitNear } from "near-social-vm";
import * as React from "react";
import { singletonHook } from "react-singleton-hook";
import { BosComponent } from "./bos-widget";
import { Overlay } from "./overlay";

export type BosWidgetFactoryConfig = {
  networkId: string;
  selector: any;
  tagName: string;
};

export class BosWidgetFactory {
  private _tagName: string;

  constructor(config: BosWidgetFactoryConfig) {
    this._tagName = config.tagName;

    // The singleton prevents the creation of new VM instances.
    const useSingletonInitNear = singletonHook(null, () => {
      const { initNear } = useInitNear();

      React.useEffect(() => {
        if (initNear) {
          initNear({
            networkId: config.networkId,
            selector: Promise.resolve(config.selector), // near-social-vm expects a promise
            features: {
              skipTxConfirmationPopup: true,
            },
            customElements: {
              Overlay: ({ children }: any) => {
                const child = children.filter(
                  (c: any) => typeof c !== "string" || !!c.trim()
                )[0];
                return <Overlay>{child}</Overlay>;
              },
            },
          });
        }
      }, [initNear]);
    });

    const ExtendedBosComponent = class extends BosComponent {
      constructor() {
        super(useSingletonInitNear);
      }
    };

    customElements.define(this._tagName, ExtendedBosComponent);
  }

  createWidget(src: string) {
    const element = document.createElement(this._tagName) as BosComponent;
    element.src = src;
    return element;
  }
}
