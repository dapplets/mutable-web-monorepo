"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreContext = exports.contextDefaultValues = void 0;
const react_1 = require("react");
exports.contextDefaultValues = {
    core: null,
    tree: null,
    attachParserConfig: () => undefined,
    detachParserConfig: () => undefined,
    updateRootContext: () => undefined,
};
exports.CoreContext = (0, react_1.createContext)(exports.contextDefaultValues);
