export declare class BosComponent extends HTMLElement {
    #private;
    private _shadowRoot;
    private _styleLibraryMountPoint;
    private _adapterStylesMountPoint;
    private _stylesMountPoint;
    private _componentMountPoint;
    private _root;
    set src(val: string);
    get src(): string;
    set styleSrc(val: string | null);
    get styleSrc(): string | null;
    set props(val: any);
    get props(): any;
    set redirectMap(val: any);
    get redirectMap(): any;
    connectedCallback(): void;
    disconnectedCallback(): void;
    _render(): void;
}
//# sourceMappingURL=bos-widget.d.ts.map