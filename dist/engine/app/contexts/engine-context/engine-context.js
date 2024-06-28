"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineContext = exports.contextDefaultValues = void 0;
const react_1 = require("react");
exports.contextDefaultValues = {
    portals: new Map(),
    addPortal: () => undefined,
    removePortal: () => undefined,
    redirectMap: null,
    enableDevMode: () => undefined,
    disableDevMode: () => undefined,
};
exports.EngineContext = (0, react_1.createContext)(exports.contextDefaultValues);
