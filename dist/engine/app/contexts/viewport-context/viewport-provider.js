"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportProvider = void 0;
const react_1 = __importDefault(require("react"));
const viewport_context_1 = require("./viewport-context");
const shadow_dom_wrapper_1 = require("../../components/shadow-dom-wrapper");
const ViewportProvider = ({ children, stylesheetSrc }) => {
    const viewportRef = react_1.default.useRef(null);
    const state = {
        viewportRef,
    };
    return (react_1.default.createElement(viewport_context_1.ViewportContext.Provider, { value: state },
        react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(shadow_dom_wrapper_1.ShadowDomWrapper, { ref: viewportRef, stylesheetSrc: stylesheetSrc, className: "mweb-layout" }),
            react_1.default.createElement(react_1.default.Fragment, null, children))));
};
exports.ViewportProvider = ViewportProvider;
