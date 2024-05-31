"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PureContextNode = void 0;
class PureContextNode {
    constructor(namespace, contextType, parsedContext = {}, insPoints = [], element = null) {
        var _a;
        this.id = null;
        this.parentNode = null;
        this.parsedContext = {};
        this.children = [];
        this.insPoints = [];
        this.element = null;
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
    }
    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
    }
}
exports.PureContextNode = PureContextNode;
