"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlighterContext = void 0;
const react_1 = require("react");
const contextDefaultValues = {
    highlighterTask: null,
    setHighlighterTask: () => undefined,
};
exports.HighlighterContext = (0, react_1.createContext)(contextDefaultValues);
