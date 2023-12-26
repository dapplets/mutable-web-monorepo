import { useInitNear } from "near-social-vm";
import * as React from "react";
import { singletonHook } from "react-singleton-hook";
import { BosComponent } from "./bos-widget";

export type BosWidgetFactoryConfig = {
  networkId: string;
  selector: any;
  nodeName: string;
};

export class BosWidgetFactory {
  private _nodeName: string;

  constructor(config: BosWidgetFactoryConfig) {
    this._nodeName = config.nodeName;

    // The singleton prevents the creation of new VM instances.
    const useSingletonInitNear = singletonHook(null, () => {
      const { initNear } = useInitNear();

      React.useEffect(() => {
        if (initNear) {
          initNear({
            networkId: config.networkId,
            selector: config.selector,
          });
        }
      }, [initNear]);
    });

    const ExtendedBosComponent = class extends BosComponent {
      constructor() {
        super(useSingletonInitNear);
      }
    };

    customElements.define(this._nodeName, ExtendedBosComponent);
  }

  createWidget(src: string) {
    const element = document.createElement(this._nodeName) as BosComponent;
    element.src = src;
    return element;
  }
}
