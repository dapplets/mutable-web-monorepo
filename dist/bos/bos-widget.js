"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BosComponent_src, _BosComponent_props, _BosComponent_redirectMap;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BosComponent = void 0;
const React = __importStar(require("react"));
const near_social_vm_1 = require("near-social-vm");
const styled_components_1 = require("styled-components");
const client_1 = require("react-dom/client");
const EventsToStopPropagation = ['click', 'keydown', 'keyup', 'keypress'];
class BosComponent extends HTMLElement {
    constructor() {
        super(...arguments);
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
        this._styleLibraryMountPoint = document.createElement('link');
        this._adapterStylesMountPoint = document.createElement('style');
        this._stylesMountPoint = document.createElement('div');
        this._componentMountPoint = document.createElement('div');
        this._root = (0, client_1.createRoot)(this._componentMountPoint);
        _BosComponent_src.set(this, '');
        _BosComponent_props.set(this, {});
        _BosComponent_redirectMap.set(this, null);
    }
    set src(val) {
        __classPrivateFieldSet(this, _BosComponent_src, val, "f");
        // this.setAttribute("data-component", val); // For debugging
        this._render();
    }
    get src() {
        return __classPrivateFieldGet(this, _BosComponent_src, "f");
    }
    set styleSrc(val) {
        if (!val) {
            this._styleLibraryMountPoint.remove();
        }
        else {
            this._styleLibraryMountPoint.href = val;
            if (!this._styleLibraryMountPoint.parentElement) {
                this._shadowRoot.appendChild(this._styleLibraryMountPoint);
            }
        }
    }
    get styleSrc() {
        return this._styleLibraryMountPoint.parentElement ? this._styleLibraryMountPoint.href : null;
    }
    set props(val) {
        __classPrivateFieldSet(this, _BosComponent_props, val, "f");
        // this.setAttribute("data-props", JSON.stringify(val)); // For debugging
        this._render();
    }
    get props() {
        return __classPrivateFieldGet(this, _BosComponent_props, "f");
    }
    set redirectMap(val) {
        if (__classPrivateFieldGet(this, _BosComponent_redirectMap, "f") === val)
            return;
        __classPrivateFieldSet(this, _BosComponent_redirectMap, val, "f");
        this._render();
    }
    get redirectMap() {
        return __classPrivateFieldGet(this, _BosComponent_redirectMap, "f");
    }
    connectedCallback() {
        // Prevent event propagation from BOS-component to parent
        EventsToStopPropagation.forEach((eventName) => {
            this.addEventListener(eventName, (e) => e.stopPropagation());
        });
        this._shadowRoot.appendChild(this._componentMountPoint);
        this._shadowRoot.appendChild(this._stylesMountPoint);
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
    `;
        this._adapterStylesMountPoint.innerHTML = resetCssRules;
        this._shadowRoot.appendChild(this._adapterStylesMountPoint);
        // For external bootstrap styles
        this._styleLibraryMountPoint.rel = 'stylesheet';
        this._shadowRoot.appendChild(this._styleLibraryMountPoint);
        this._componentMountPoint.setAttribute('data-bs-theme', 'light');
        // For full-width components
        this._componentMountPoint.style.flex = '1';
        // Initial render
        this._render();
    }
    disconnectedCallback() {
        this._root.unmount();
    }
    _render() {
        this._root.render(React.createElement(styled_components_1.StyleSheetManager, { target: this._stylesMountPoint },
            React.createElement(near_social_vm_1.Widget, { src: __classPrivateFieldGet(this, _BosComponent_src, "f"), props: __classPrivateFieldGet(this, _BosComponent_props, "f"), config: { redirectMap: __classPrivateFieldGet(this, _BosComponent_redirectMap, "f") }, loading: React.createElement(React.Fragment, null) })));
    }
}
exports.BosComponent = BosComponent;
_BosComponent_src = new WeakMap(), _BosComponent_props = new WeakMap(), _BosComponent_redirectMap = new WeakMap();
