import { BosComponent } from './bos-widget';
export type BosWidgetFactoryConfig = {
    tagName: string;
    bosElementStyleSrc?: string;
};
export declare class BosWidgetFactory {
    private _tagName;
    private _styleSrc?;
    constructor(config: BosWidgetFactoryConfig);
    createWidget(src: string): BosComponent;
}
//# sourceMappingURL=bos-widget-factory.d.ts.map