"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHighlighter = void 0;
const react_1 = require("react");
const highlighter_context_1 = require("./highlighter-context");
function useHighlighter() {
    return (0, react_1.useContext)(highlighter_context_1.HighlighterContext);
}
exports.useHighlighter = useHighlighter;
