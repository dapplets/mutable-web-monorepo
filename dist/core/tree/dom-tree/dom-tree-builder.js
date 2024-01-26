"use strict";
// @ts-nocheck
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
var _DomTreeBuilder_instances, _DomTreeBuilder_document, _DomTreeBuilder_contextListener, _DomTreeBuilder_observer, _DomTreeBuilder_handleMutations;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomTreeBuilder = void 0;
class DomTreeBuilder {
    constructor(contextListener) {
        _DomTreeBuilder_instances.add(this);
        _DomTreeBuilder_document.set(this, void 0);
        _DomTreeBuilder_contextListener.set(this, void 0);
        _DomTreeBuilder_observer.set(this, void 0);
        __classPrivateFieldSet(this, _DomTreeBuilder_contextListener, contextListener, "f");
        __classPrivateFieldSet(this, _DomTreeBuilder_document, document.implementation.createDocument(null, "semantictree"), "f");
        this.root = this.createNode(null, "root");
        __classPrivateFieldSet(this, _DomTreeBuilder_observer, new MutationObserver(__classPrivateFieldGet(this, _DomTreeBuilder_instances, "m", _DomTreeBuilder_handleMutations).bind(this)), "f");
        __classPrivateFieldGet(this, _DomTreeBuilder_observer, "f").observe(this.root, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true,
        });
    }
    appendChild(parent, child) {
        parent.appendChild(child);
    }
    removeChild(parent, child) {
        parent.removeChild(child);
    }
    createNode(namespaceURI, tagName) {
        return __classPrivateFieldGet(this, _DomTreeBuilder_document, "f").createElementNS(namespaceURI, tagName);
    }
    updateParsedContext(context, newParsedContext) {
        const oldParsedContext = context.parsedContext;
        if ((oldParsedContext === null || oldParsedContext === void 0 ? void 0 : oldParsedContext.id) !== newParsedContext.id) {
            __classPrivateFieldGet(this, _DomTreeBuilder_contextListener, "f").handleContextFinished(context);
            context.parsedContext = newParsedContext;
            context.id = newParsedContext.id;
            __classPrivateFieldGet(this, _DomTreeBuilder_contextListener, "f").handleContextStarted(context);
        }
        else {
            context.parsedContext = newParsedContext;
            __classPrivateFieldGet(this, _DomTreeBuilder_contextListener, "f").handleContextChanged(context, oldParsedContext);
        }
    }
    /**
     * Returns a serialized XML tree
     * @experimental
     */
    getSerializedXmlTree() {
        const serializer = new XMLSerializer();
        return serializer.serializeToString(__classPrivateFieldGet(this, _DomTreeBuilder_document, "f"));
    }
}
exports.DomTreeBuilder = DomTreeBuilder;
_DomTreeBuilder_document = new WeakMap(), _DomTreeBuilder_contextListener = new WeakMap(), _DomTreeBuilder_observer = new WeakMap(), _DomTreeBuilder_instances = new WeakSet(), _DomTreeBuilder_handleMutations = function _DomTreeBuilder_handleMutations(mutations) {
    for (const mutation of mutations) {
        if (mutation.type === "childList") {
            for (const addedNode of mutation.addedNodes) {
                if (addedNode instanceof Element) {
                    __classPrivateFieldGet(this, _DomTreeBuilder_contextListener, "f").handleContextStarted(addedNode);
                }
            }
            for (const removedNode of mutation.removedNodes) {
                if (removedNode instanceof Element) {
                    __classPrivateFieldGet(this, _DomTreeBuilder_contextListener, "f").handleContextFinished(removedNode);
                }
            }
        }
    }
};
