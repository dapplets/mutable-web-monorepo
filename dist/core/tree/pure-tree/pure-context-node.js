"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PureContextNode = void 0;
class PureContextNode {
    constructor(namespaceURI, tagName) {
        this.id = null;
        this.parentNode = null;
        this.parsedContext = {};
        this.children = [];
        this.insPoints = [];
        this.namespaceURI = namespaceURI;
        this.tagName = tagName;
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
