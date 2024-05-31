"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _DynamicHtmlAdapter_observerByElement, _DynamicHtmlAdapter_elementByContext, _DynamicHtmlAdapter_contextByElement, _DynamicHtmlAdapter_isStarted;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicHtmlAdapter = void 0;
const interface_1 = require("./interface");
const DefaultInsertionType = interface_1.InsertionType.Before;
class DynamicHtmlAdapter {
    constructor(element, treeBuilder, namespace, parser) {
        _DynamicHtmlAdapter_observerByElement.set(this, new Map());
        _DynamicHtmlAdapter_elementByContext.set(this, new WeakMap());
        _DynamicHtmlAdapter_contextByElement.set(this, new Map());
        _DynamicHtmlAdapter_isStarted.set(this, false); // ToDo: find another way to check if adapter is started
        this.element = element;
        this.treeBuilder = treeBuilder;
        this.namespace = namespace;
        this.parser = parser;
        this.context = this._createContextForElement(element, 'root');
    }
    start() {
        __classPrivateFieldGet(this, _DynamicHtmlAdapter_observerByElement, "f").forEach((observer, element) => {
            observer.observe(element, {
                attributes: true,
                childList: true,
                subtree: true,
                characterData: true,
            });
            // initial parsing without waiting for mutations in the DOM
            this._handleMutations(element, __classPrivateFieldGet(this, _DynamicHtmlAdapter_contextByElement, "f").get(element));
        });
        __classPrivateFieldSet(this, _DynamicHtmlAdapter_isStarted, true, "f");
    }
    stop() {
        __classPrivateFieldSet(this, _DynamicHtmlAdapter_isStarted, false, "f");
        __classPrivateFieldGet(this, _DynamicHtmlAdapter_observerByElement, "f").forEach((observer) => observer.disconnect());
    }
    injectElement(injectingElement, context, insertionPoint) {
        var _a;
        const contextElement = __classPrivateFieldGet(this, _DynamicHtmlAdapter_elementByContext, "f").get(context);
        if (!contextElement) {
            throw new Error('Context element not found');
        }
        const insPoint = this.parser
            .getInsertionPoints(contextElement, context.contextType)
            .find((ip) => ip.name === insertionPoint);
        if (!insPoint) {
            throw new Error(`Insertion point "${insertionPoint}" is not defined in the parser`);
        }
        const insPointElement = this.parser.findInsertionPoint(contextElement, context.contextType, insertionPoint);
        const insertionType = (_a = insPoint.insertionType) !== null && _a !== void 0 ? _a : DefaultInsertionType;
        if (!insPointElement) {
            throw new Error(`Insertion point "${insertionPoint}" not found in "${context.contextType}" context type for "${insertionType}" insertion type`);
        }
        switch (insertionType) {
            case interface_1.InsertionType.Before:
                insPointElement.before(injectingElement);
                break;
            case interface_1.InsertionType.After:
                insPointElement.after(injectingElement);
                break;
            case interface_1.InsertionType.End:
                insPointElement.appendChild(injectingElement);
                break;
            case interface_1.InsertionType.Begin:
                insPointElement.insertBefore(injectingElement, insPointElement.firstChild);
                break;
            default:
                throw new Error('Unknown insertion type');
        }
    }
    getInsertionPoints(context) {
        const htmlElement = __classPrivateFieldGet(this, _DynamicHtmlAdapter_elementByContext, "f").get(context);
        if (!htmlElement)
            return [];
        return this.parser.getInsertionPoints(htmlElement, context.contextType);
    }
    getContextElement(context) {
        var _a;
        return (_a = __classPrivateFieldGet(this, _DynamicHtmlAdapter_elementByContext, "f").get(context)) !== null && _a !== void 0 ? _a : null;
    }
    getInsertionPointElement(context, insPointName) {
        const contextElement = this.getContextElement(context);
        if (!contextElement)
            return null;
        return this.parser.findInsertionPoint(contextElement, context.contextType, insPointName);
    }
    _createContextForElement(element, contextName) {
        const parsedContext = this.parser.parseContext(element, contextName);
        const insPoints = this._findAvailableInsPoints(element, contextName);
        const context = this.treeBuilder.createNode(this.namespace, contextName, parsedContext, insPoints, element);
        const observer = new MutationObserver(() => this._handleMutations(element, context));
        __classPrivateFieldGet(this, _DynamicHtmlAdapter_observerByElement, "f").set(element, observer);
        __classPrivateFieldGet(this, _DynamicHtmlAdapter_elementByContext, "f").set(context, element);
        __classPrivateFieldGet(this, _DynamicHtmlAdapter_contextByElement, "f").set(element, context);
        // ToDo: duplicate code
        if (__classPrivateFieldGet(this, _DynamicHtmlAdapter_isStarted, "f")) {
            observer.observe(element, {
                attributes: true,
                childList: true,
                subtree: true,
                characterData: true,
            });
        }
        return context;
    }
    _handleMutations(element, context) {
        const parsedContext = this.parser.parseContext(element, context.contextType);
        const pairs = this.parser.findChildElements(element, context.contextType);
        const insPoints = this._findAvailableInsPoints(element, context.contextType);
        this.treeBuilder.updateParsedContext(context, parsedContext);
        this.treeBuilder.updateInsertionPoints(context, insPoints);
        this._appendNewChildContexts(pairs, context);
        this._removeOldChildContexts(pairs, context);
    }
    _appendNewChildContexts(childPairs, parentContext) {
        for (const { element, contextName } of childPairs) {
            if (!__classPrivateFieldGet(this, _DynamicHtmlAdapter_contextByElement, "f").has(element)) {
                const childContext = this._createContextForElement(element, contextName);
                __classPrivateFieldGet(this, _DynamicHtmlAdapter_contextByElement, "f").set(element, childContext);
                this.treeBuilder.appendChild(parentContext, childContext);
                // initial parsing
                this._handleMutations(element, childContext);
            }
        }
    }
    _removeOldChildContexts(childPairs, parentContext) {
        var _a;
        const childElementsSet = new Set(childPairs.map((pair) => pair.element));
        for (const [element, context] of __classPrivateFieldGet(this, _DynamicHtmlAdapter_contextByElement, "f")) {
            if (!childElementsSet.has(element) && context.parentNode === parentContext) {
                this.treeBuilder.removeChild(parentContext, context);
                __classPrivateFieldGet(this, _DynamicHtmlAdapter_contextByElement, "f").delete(element);
                (_a = __classPrivateFieldGet(this, _DynamicHtmlAdapter_observerByElement, "f").get(element)) === null || _a === void 0 ? void 0 : _a.disconnect();
                __classPrivateFieldGet(this, _DynamicHtmlAdapter_observerByElement, "f").delete(element);
            }
        }
    }
    // ToDo: move to parser?
    _findAvailableInsPoints(element, contextName) {
        const parser = this.parser;
        const definedInsPoints = parser.getInsertionPoints(element, contextName);
        const availableInsPoints = definedInsPoints
            .filter((ip) => !!parser.findInsertionPoint(element, contextName, ip.name))
            .map((ip) => ip.name);
        return availableInsPoints;
    }
}
exports.DynamicHtmlAdapter = DynamicHtmlAdapter;
_DynamicHtmlAdapter_observerByElement = new WeakMap(), _DynamicHtmlAdapter_elementByContext = new WeakMap(), _DynamicHtmlAdapter_contextByElement = new WeakMap(), _DynamicHtmlAdapter_isStarted = new WeakMap();
