"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MicrodataParser = void 0;
const utils_1 = require("./utils");
class MicrodataParser {
    parseContext(element) {
        var _a;
        const childElements = (0, utils_1.getChildContextElements)(element, 'itemprop');
        const result = {};
        for (const childElement of childElements) {
            const propName = childElement.getAttribute('itemprop');
            const propValue = (_a = MicrodataParser.getPropertyValue(childElement)) !== null && _a !== void 0 ? _a : null;
            result[propName] = propValue;
        }
        if (element.hasAttribute('itemid')) {
            const id = element.getAttribute('itemid');
            result['id'] = id;
        }
        return result;
    }
    findChildElements(element) {
        return (0, utils_1.getChildContextElements)(element, 'itemtype').map((element) => ({
            element,
            contextName: element.getAttribute('itemtype'),
        }));
    }
    findInsertionPoint(element, _, insertionPoint) {
        return element.querySelector(`[itemtype="${insertionPoint}"]`);
    }
    getInsertionPoints(element) {
        return (0, utils_1.getChildContextElements)(element, 'itemtype').map((el) => ({
            name: el.getAttribute('itemtype'),
        }));
    }
    static getPropertyValue(element) {
        var _a, _b, _c;
        if (element.hasAttribute('itemscope')) {
            return undefined;
        }
        else if (element.tagName.toLowerCase() === 'meta') {
            return (_a = element.getAttribute('content')) === null || _a === void 0 ? void 0 : _a.trim();
        }
        else if (['audio', 'embed', 'iframe', 'img', 'source', 'track', 'video'].includes(element.tagName.toLowerCase()) ||
            ['a', 'area', 'link'].includes(element.tagName.toLowerCase())) {
            return element.getAttribute('src') || element.getAttribute('href') || '';
        }
        else if (element.tagName.toLowerCase() === 'object') {
            return element.getAttribute('data') || '';
        }
        else if (element.tagName.toLowerCase() === 'data' ||
            element.tagName.toLowerCase() === 'meter') {
            return element.getAttribute('value') || '';
        }
        else if (element.tagName.toLowerCase() === 'time') {
            return element.getAttribute('datetime') || '';
        }
        else if (element.hasAttribute('content')) {
            return (_b = element.getAttribute('content')) === null || _b === void 0 ? void 0 : _b.trim();
        }
        else {
            return (_c = element.textContent) === null || _c === void 0 ? void 0 : _c.trim();
        }
    }
}
exports.MicrodataParser = MicrodataParser;
