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
        // Namespace is used as ID for the root context
        this.context = this._tryCreateContextForElement(element, 'root', this.namespace);
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
    _tryCreateContextForElement(element, contextName, defaultContextId) {
        const parsedContext = this.parser.parseContext(element, contextName);
        if (!parsedContext.id) {
            if (!defaultContextId) {
                return null;
            }
            else {
                parsedContext.id = defaultContextId;
            }
        }
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
        this._removeOldChildContexts(pairs, context);
        this._appendNewChildContexts(pairs, context);
    }
    _appendNewChildContexts(childPairs, parentContext) {
        for (const { element, contextName } of childPairs) {
            if (!__classPrivateFieldGet(this, _DynamicHtmlAdapter_contextByElement, "f").has(element)) {
                const childContext = this._tryCreateContextForElement(element, contextName);
                if (!childContext) {
                    continue;
                }
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
            .map((ip) => (Object.assign(Object.assign({}, ip), { element: parser.findInsertionPoint(element, contextName, ip.name) })))
            .filter((ip) => !!ip.element);
        return availableInsPoints;
    }
}
exports.DynamicHtmlAdapter = DynamicHtmlAdapter;
_DynamicHtmlAdapter_observerByElement = new WeakMap(), _DynamicHtmlAdapter_elementByContext = new WeakMap(), _DynamicHtmlAdapter_contextByElement = new WeakMap(), _DynamicHtmlAdapter_isStarted = new WeakMap();
