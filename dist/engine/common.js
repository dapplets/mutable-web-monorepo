"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getViewport = void 0;
const constants_1 = require("./constants");
function getViewport() {
    var _a, _b, _c;
    return ((_c = (_b = (_a = document
        .getElementById(constants_1.ViewportElementId)) === null || _a === void 0 ? void 0 : _a.shadowRoot) === null || _b === void 0 ? void 0 : _b.getElementById(constants_1.ViewportInnerElementId)) !== null && _c !== void 0 ? _c : null);
}
exports.getViewport = getViewport;
