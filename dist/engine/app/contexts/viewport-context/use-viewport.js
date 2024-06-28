"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useViewport = void 0;
const react_1 = require("react");
const viewport_context_1 = require("./viewport-context");
function useViewport() {
    return (0, react_1.useContext)(viewport_context_1.ViewportContext);
}
exports.useViewport = useViewport;
