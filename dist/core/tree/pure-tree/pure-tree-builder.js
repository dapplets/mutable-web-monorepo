"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PureTreeBuilder = void 0;
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const pure_context_node_1 = require("./pure-context-node");
class PureTreeBuilder {
    constructor(_eventEmitter) {
        this._eventEmitter = _eventEmitter;
        // ToDo: move to engine, it's not a core responsibility
        this.root = this.createNode(constants_1.DappletsEngineNs, 'website'); // default ns
    }
    appendChild(parent, child) {
        var _a;
        parent.appendChild(child);
        this._emitContextStarted(child);
        (_a = child.insPoints) === null || _a === void 0 ? void 0 : _a.forEach((ip) => this._emitInsPointStarted(child, ip));
    }
    removeChild(parent, child) {
        var _a;
        parent.removeChild(child);
        this._emitContextFinished(child);
        (_a = child.insPoints) === null || _a === void 0 ? void 0 : _a.forEach((ip) => this._emitInsPointFinished(child, ip));
    }
    createNode(namespace, contextType, parsedContext = {}, insPoints = [], element = null) {
        return new pure_context_node_1.PureContextNode(namespace, contextType, parsedContext, insPoints, element);
    }
    updateParsedContext(context, newParsedContext) {
        const oldParsedContext = context.parsedContext;
        // ToDo: what to do with contexts without IDs?
        if ((oldParsedContext === null || oldParsedContext === void 0 ? void 0 : oldParsedContext.id) !== (newParsedContext === null || newParsedContext === void 0 ? void 0 : newParsedContext.id)) {
            this._emitContextFinished(context);
            context.parsedContext = newParsedContext;
            context.id = newParsedContext.id;
            this._emitContextStarted(context);
        }
        else if (!(0, utils_1.isDeepEqual)(oldParsedContext, newParsedContext)) {
            context.parsedContext = newParsedContext;
            this._emitContextChanged(context, oldParsedContext);
        }
    }
    updateInsertionPoints(context, foundIPs) {
        var _a;
        // IPs means insertion points
        const existingIPs = (_a = context.insPoints) !== null && _a !== void 0 ? _a : [];
        context.insPoints = foundIPs;
        const oldIPs = existingIPs.filter((ip) => !foundIPs.includes(ip));
        const newIPs = foundIPs.filter((ip) => !existingIPs.includes(ip));
        oldIPs.forEach((ip) => this._emitInsPointFinished(context, ip));
        newIPs.forEach((ip) => this._emitInsPointStarted(context, ip));
    }
    clear() {
        // ToDo: move to engine, it's not a core responsibility
        this.root = this.createNode(constants_1.DappletsEngineNs, 'website'); // default ns
    }
    _emitContextStarted(context) {
        this._eventEmitter.emit('contextStarted', { context });
    }
    _emitContextChanged(context, previousContext) {
        this._eventEmitter.emit('contextChanged', { context, previousContext });
    }
    _emitContextFinished(context) {
        this._eventEmitter.emit('contextFinished', { context });
    }
    _emitInsPointStarted(context, insertionPoint) {
        this._eventEmitter.emit('insertionPointStarted', {
            context,
            insertionPoint,
        });
    }
    _emitInsPointFinished(context, insertionPoint) {
        this._eventEmitter.emit('insertionPointFinished', {
            context,
            insertionPoint,
        });
    }
}
exports.PureTreeBuilder = PureTreeBuilder;
