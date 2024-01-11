import { BosComponent } from "./bos-widget";
export type BosWidgetFactoryConfig = {
    tagName: string;
};
export declare class BosWidgetFactory {
    private _tagName;
    constructor(config: BosWidgetFactoryConfig);
    createWidget(src: string): BosComponent;
}
//# sourceMappingURL=bos-widget-factory.d.ts.map