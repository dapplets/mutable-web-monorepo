"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutableWebParser = void 0;
const utils_1 = require("./utils");
const interface_1 = require("../adapters/interface");
const ParsedContextAttr = 'data-mweb-context-parsed';
const ContextTypeAttr = 'data-mweb-context-type';
const InsPointAttr = 'data-mweb-insertion-point';
const ShadowHostAttr = 'data-mweb-shadow-host';
const LayoutManagerAttr = 'data-mweb-layout-manager';
class MutableWebParser {
    parseContext(element, contextName) {
        const json = element.getAttribute(ParsedContextAttr);
        if (!json)
            return {};
        return JSON.parse(json);
    }
    findChildElements(element) {
        return (0, utils_1.getChildContextElements)(element, ContextTypeAttr).map((element) => ({
            element,
            contextName: element.getAttribute(ContextTypeAttr),
        }));
    }
    findInsertionPoint(element, contextName, insertionPoint) {
        // ToDo: use getChildContextElements
        const insPointElement = element.querySelector(`[${InsPointAttr}="${insertionPoint}"]`);
        if (insPointElement)
            return insPointElement;
        if (element instanceof Element && element.hasAttribute(ShadowHostAttr) && element.shadowRoot) {
            return this.findInsertionPoint(element.shadowRoot, contextName, insertionPoint);
        }
        const shadowHosts = element.querySelectorAll(`[${ShadowHostAttr}]`);
        for (const shadowHost of shadowHosts) {
            if (!shadowHost.shadowRoot)
                continue;
            const insPointElement = this.findInsertionPoint(shadowHost.shadowRoot, contextName, insertionPoint);
            if (insPointElement)
                return insPointElement;
        }
        return null;
    }
    getInsertionPoints(element) {
        return (0, utils_1.getChildContextElements)(element, InsPointAttr, ContextTypeAttr).map((el) => ({
            name: el.getAttribute(InsPointAttr),
            insertionType: interface_1.InsertionType.End,
            bosLayoutManager: el.getAttribute(LayoutManagerAttr) || undefined,
        }));
    }
}
exports.MutableWebParser = MutableWebParser;
