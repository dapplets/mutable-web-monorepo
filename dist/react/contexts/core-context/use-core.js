"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCore = void 0;
const react_1 = require("react");
const core_context_1 = require("./core-context");
function useCore() {
    return (0, react_1.useContext)(core_context_1.CoreContext);
}
exports.useCore = useCore;
