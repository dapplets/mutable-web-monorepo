"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PureTreeBuilder = void 0;
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const pure_context_node_1 = require("./pure-context-node");
class PureTreeBuilder {
    constructor() {
        // ToDo: move to engine, it's not a core responsibility
        this.root = this.createNode(constants_1.DappletsEngineNs, 'website', {
            id: window.location.hostname,
        }); // default ns
    }
    appendChild(parent, child) {
        parent.appendChild(child);
    }
    removeChild(parent, child) {
        parent.removeChild(child);
    }
    createNode(namespace, contextType, parsedContext = {}, insPoints = [], element = null) {
        return new pure_context_node_1.PureContextNode(namespace, contextType, parsedContext, insPoints, element);
    }
    updateParsedContext(context, newParsedContext) {
        const oldParsedContext = context.parsedContext;
        // ToDo: what to do with contexts without IDs?
        if ((oldParsedContext === null || oldParsedContext === void 0 ? void 0 : oldParsedContext.id) !== (newParsedContext === null || newParsedContext === void 0 ? void 0 : newParsedContext.id)) {
            // ToDo: remove child?
            context.parsedContext = newParsedContext;
            context.id = newParsedContext.id;
        }
        else if (!(0, utils_1.isDeepEqual)(oldParsedContext, newParsedContext)) {
            context.parsedContext = newParsedContext;
        }
    }
    updateInsertionPoints(context, foundIPs) {
        var _a;
        // IPs means insertion points
        const existingIPs = (_a = context.insPoints) !== null && _a !== void 0 ? _a : [];
        const oldIPs = existingIPs.filter((ip) => !foundIPs.some((_ip) => _ip.name === ip.name));
        const newIPs = foundIPs.filter((ip) => !existingIPs.some((_ip) => _ip.name === ip.name));
        // Remove old IPs from context.insPoints
        oldIPs.forEach((ip) => {
            context.removeInsPoint(ip.name);
        });
        // Add new IPs to context.insPoints
        newIPs.forEach((ip) => {
            context.appendInsPoint(ip);
        });
    }
    clear() {
        // ToDo: move to engine, it's not a core responsibility
        this.root = this.createNode(constants_1.DappletsEngineNs, 'website'); // default ns
    }
}
exports.PureTreeBuilder = PureTreeBuilder;
