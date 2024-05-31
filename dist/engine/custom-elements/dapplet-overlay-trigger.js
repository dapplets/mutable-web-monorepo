"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DappletOverlayTrigger = void 0;
const React = __importStar(require("react"));
const react_1 = require("react");
const react_bootstrap_1 = require("react-bootstrap");
const common_1 = require("../common");
const styled_components_1 = require("styled-components");
// ToDo: remove any
const DappletOverlayTrigger = (_a) => {
    var { children } = _a, attributes = __rest(_a, ["children"]);
    const child = children.filter((c) => typeof c !== 'string' || !!c.trim())[0];
    const viewport = (0, common_1.getViewport)();
    if (!viewport)
        return null;
    const Overlay = (0, react_1.forwardRef)((props, ref) => {
        const stylesRef = (0, react_1.useRef)(null);
        return (React.createElement("div", { ref: stylesRef }, stylesRef.current ? (React.createElement(styled_components_1.StyleSheetManager, { target: stylesRef.current }, (0, react_1.cloneElement)(attributes.overlay, Object.assign(Object.assign({}, props), { ref })))) : null));
    });
    return (React.createElement(react_bootstrap_1.OverlayTrigger, Object.assign({}, attributes, { container: viewport, overlay: React.createElement(Overlay, null) }), child));
};
exports.DappletOverlayTrigger = DappletOverlayTrigger;
