"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEngine = void 0;
const react_1 = require("react");
const engine_context_1 = require("./engine-context");
function useEngine() {
    return (0, react_1.useContext)(engine_context_1.EngineContext);
}
exports.useEngine = useEngine;
