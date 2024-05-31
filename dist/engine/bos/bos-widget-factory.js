"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BosWidgetFactory = void 0;
const bos_widget_1 = require("./bos-widget");
class BosWidgetFactory {
    constructor(config) {
        this._tagName = config.tagName;
        this._styleSrc = config.bosElementStyleSrc;
        const ExtendedBosComponent = class extends bos_widget_1.BosComponent {
        };
        customElements.define(this._tagName, ExtendedBosComponent);
    }
    createWidget(src) {
        var _a;
        const element = document.createElement(this._tagName);
        element.src = src;
        element.styleSrc = (_a = this._styleSrc) !== null && _a !== void 0 ? _a : null;
        return element;
    }
}
exports.BosWidgetFactory = BosWidgetFactory;
