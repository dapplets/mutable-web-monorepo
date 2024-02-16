"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonParser = void 0;
const query = (cssOrXPath, element) => {
    try {
        const result = element.querySelector(cssOrXPath);
        if (result)
            return result.textContent;
    }
    catch (_) { }
    try {
        // ToDo: replace with document.createExpression ?
        const result = element.ownerDocument.evaluate(cssOrXPath, element, null, 0);
        switch (result.resultType) {
            case XPathResult.NUMBER_TYPE:
                return result.numberValue;
            case XPathResult.STRING_TYPE:
                return result.stringValue;
            case XPathResult.BOOLEAN_TYPE:
                return result.booleanValue;
            default:
                return null; // ToDo: or undefined?
        }
    }
    catch (_) {
        console.error(_);
    }
    return null;
};
class JsonParser {
    constructor(config) {
        // ToDo: validate config
        this.config = config;
    }
    parseContext(element, contextName) {
        var _a, _b;
        const contextProperties = this.config.contexts[contextName].props;
        if (!contextProperties)
            return {};
        const parsed = {};
        for (const [prop, cssOrXpathQuery] of Object.entries(contextProperties)) {
            const value = (_b = (_a = query(cssOrXpathQuery, element)) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : null;
            parsed[prop] = value;
        }
        return parsed;
    }
    findChildElements(element, contextName) {
        var _a, _b;
        const contextConfig = this.config.contexts[contextName];
        if (!((_a = contextConfig.children) === null || _a === void 0 ? void 0 : _a.length))
            return [];
        const result = [];
        for (const childContextName of (_b = contextConfig.children) !== null && _b !== void 0 ? _b : []) {
            const childConfig = this.config.contexts[childContextName];
            if (!childConfig.selector)
                continue;
            const childElements = Array.from(element.querySelectorAll(childConfig.selector));
            for (const childElement of childElements) {
                result.push({ element: childElement, contextName: childContextName });
            }
        }
        return result;
    }
    findInsertionPoint(element, contextName, insertionPoint) {
        var _a;
        const contextConfig = this.config.contexts[contextName];
        const selectorOrObject = (_a = contextConfig.insertionPoints) === null || _a === void 0 ? void 0 : _a[insertionPoint];
        if (typeof selectorOrObject === 'string') {
            return element.querySelector(selectorOrObject);
        }
        else if (selectorOrObject === null || selectorOrObject === void 0 ? void 0 : selectorOrObject.selector) {
            return element.querySelector(selectorOrObject.selector);
        }
        else {
            return null;
        }
    }
    getInsertionPoints(_, contextName) {
        const contextConfig = this.config.contexts[contextName];
        if (!contextConfig.insertionPoints)
            return [];
        return Object.entries(contextConfig.insertionPoints).map(([name, selectorOrObject]) => ({
            name,
            insertionType: typeof selectorOrObject === 'string' ? undefined : selectorOrObject.insertionType,
            bosLayoutManager: typeof selectorOrObject === 'string' ? undefined : selectorOrObject.bosLayoutManager,
        }));
    }
}
exports.JsonParser = JsonParser;
