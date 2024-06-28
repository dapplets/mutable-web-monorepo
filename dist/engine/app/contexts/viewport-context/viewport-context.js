"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportContext = exports.contextDefaultValues = void 0;
const react_1 = require("react");
exports.contextDefaultValues = {
    viewportRef: null,
};
exports.ViewportContext = (0, react_1.createContext)(exports.contextDefaultValues);
