"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BosWidgetFactory = void 0;
const bos_widget_1 = require("./bos-widget");
class BosWidgetFactory {
    constructor(config) {
        this._tagName = config.tagName;
        customElements.define(this._tagName, bos_widget_1.BosComponent);
    }
    createWidget(src) {
        const element = document.createElement(this._tagName);
        element.src = src;
        return element;
    }
}
exports.BosWidgetFactory = BosWidgetFactory;
