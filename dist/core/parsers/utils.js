"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChildContextElements = void 0;
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
            else {
                result.push(...getChildContextElements(child, attribute));
            }
        }
    }
    return result;
}
exports.getChildContextElements = getChildContextElements;
