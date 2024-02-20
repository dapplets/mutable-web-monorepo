"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PureContextNode = void 0;
class PureContextNode {
    constructor(namespace, contextType) {
        this.id = null;
        this.parentNode = null;
        this.parsedContext = {};
        this.children = [];
        this.insPoints = [];
        this.namespace = namespace;
        this.contextType = contextType;
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
