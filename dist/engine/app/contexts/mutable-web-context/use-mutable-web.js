"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMutableWeb = void 0;
const react_1 = require("react");
const mutable_web_context_1 = require("./mutable-web-context");
function useMutableWeb() {
    return (0, react_1.useContext)(mutable_web_context_1.MutableWebContext);
}
exports.useMutableWeb = useMutableWeb;
