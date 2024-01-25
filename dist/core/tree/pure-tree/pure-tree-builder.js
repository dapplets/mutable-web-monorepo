"use strict";
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
var _PureTreeBuilder_contextListener;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PureTreeBuilder = void 0;
const constants_1 = require("../../../constants");
const utils_1 = require("../../utils");
const pure_context_node_1 = require("./pure-context-node");
class PureTreeBuilder {
    constructor(contextListener) {
        _PureTreeBuilder_contextListener.set(this, void 0);
        // ToDo: move to engine, it's not a core responsibility
        this.root = this.createNode(constants_1.DappletsEngineNs, "website"); // default ns
        __classPrivateFieldSet(this, _PureTreeBuilder_contextListener, contextListener, "f");
    }
    appendChild(parent, child) {
        parent.appendChild(child);
        __classPrivateFieldGet(this, _PureTreeBuilder_contextListener, "f").handleContextStarted(child);
    }
    removeChild(parent, child) {
        parent.removeChild(child);
        __classPrivateFieldGet(this, _PureTreeBuilder_contextListener, "f").handleContextFinished(child);
    }
    createNode(namespaceURI, tagName) {
        return new pure_context_node_1.PureContextNode(namespaceURI, tagName);
    }
    updateParsedContext(context, newParsedContext) {
        const oldParsedContext = context.parsedContext;
        if ((oldParsedContext === null || oldParsedContext === void 0 ? void 0 : oldParsedContext.id) !== (newParsedContext === null || newParsedContext === void 0 ? void 0 : newParsedContext.id)) {
            __classPrivateFieldGet(this, _PureTreeBuilder_contextListener, "f").handleContextFinished(context);
            context.parsedContext = newParsedContext;
            context.id = newParsedContext.id;
            __classPrivateFieldGet(this, _PureTreeBuilder_contextListener, "f").handleContextStarted(context);
        }
        else if (!(0, utils_1.isDeepEqual)(oldParsedContext, newParsedContext)) {
            context.parsedContext = newParsedContext;
            __classPrivateFieldGet(this, _PureTreeBuilder_contextListener, "f").handleContextChanged(context, oldParsedContext);
        }
    }
}
exports.PureTreeBuilder = PureTreeBuilder;
_PureTreeBuilder_contextListener = new WeakMap();
