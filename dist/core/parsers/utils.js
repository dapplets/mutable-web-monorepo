"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChildContextElements = void 0;
const ShadowHostAttr = 'data-mweb-shadow-host';
function getChildContextElements(element, attribute, excludeAttribute) {
    const result = [];
    for (const child of element.children) {
        if (child instanceof HTMLElement) {
            if (excludeAttribute && child.hasAttribute(excludeAttribute)) {
                continue;
            }
            else if (child.hasAttribute(attribute)) {
                result.push(child);
            }
            else if (child.hasAttribute(ShadowHostAttr) && child.shadowRoot) {
                // ToDo: it's mweb-parser specific logic
                result.push(...getChildContextElements(child.shadowRoot, attribute, excludeAttribute));
            }
            else {
                result.push(...getChildContextElements(child, attribute, excludeAttribute));
            }
        }
    }
    return result;
}
exports.getChildContextElements = getChildContextElements;
