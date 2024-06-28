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
var _PureContextNode_parsedContext, _PureContextNode_eventEmitter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PureContextNode = void 0;
const event_emitter_1 = require("../../event-emitter");
class PureContextNode {
    get parsedContext() {
        return __classPrivateFieldGet(this, _PureContextNode_parsedContext, "f");
    }
    set parsedContext(parsedContext) {
        __classPrivateFieldSet(this, _PureContextNode_parsedContext, parsedContext, "f");
        __classPrivateFieldGet(this, _PureContextNode_eventEmitter, "f").emit('contextChanged', {});
    }
    constructor(namespace, contextType, parsedContext = {}, insPoints = [], element = null) {
        var _a;
        this.id = null;
        this.parentNode = null;
        this.children = [];
        this.insPoints = []; // ToDo: replace with Map
        this.element = null;
        _PureContextNode_parsedContext.set(this, {});
        _PureContextNode_eventEmitter.set(this, new event_emitter_1.EventEmitter()); // ToDo: implement event bubbling?
        this.namespace = namespace;
        this.contextType = contextType;
        this.parsedContext = parsedContext;
        this.insPoints = insPoints;
        this.element = element;
        // ToDo: the similar logic is in tree builder
        this.id = (_a = parsedContext.id) !== null && _a !== void 0 ? _a : null;
    }
    removeChild(child) {
        child.parentNode = null;
        this.children = this.children.filter((c) => c !== child);
        __classPrivateFieldGet(this, _PureContextNode_eventEmitter, "f").emit('childContextRemoved', { child });
        // ToDo: remove children of removed context?
    }
    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
        __classPrivateFieldGet(this, _PureContextNode_eventEmitter, "f").emit('childContextAdded', { child });
    }
    appendInsPoint(insertionPoint) {
        this.insPoints.push(insertionPoint);
        __classPrivateFieldGet(this, _PureContextNode_eventEmitter, "f").emit('insertionPointAdded', { insertionPoint });
    }
    removeInsPoint(insertionPointName) {
        const insPointToRemove = this.insPoints.find((ip) => ip.name === insertionPointName);
        if (!insPointToRemove)
            return;
        this.insPoints = this.insPoints.filter((ip) => ip.name !== insertionPointName);
        __classPrivateFieldGet(this, _PureContextNode_eventEmitter, "f").emit('insertionPointRemoved', { insertionPoint: insPointToRemove });
    }
    on(eventName, callback) {
        return __classPrivateFieldGet(this, _PureContextNode_eventEmitter, "f").on(eventName, callback);
    }
}
exports.PureContextNode = PureContextNode;
_PureContextNode_parsedContext = new WeakMap(), _PureContextNode_eventEmitter = new WeakMap();
