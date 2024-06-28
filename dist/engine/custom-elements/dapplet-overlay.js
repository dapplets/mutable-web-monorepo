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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DappletOverlay = exports.Overlay = void 0;
const React = __importStar(require("react"));
const react_dom_1 = require("react-dom");
const styled_components_1 = __importDefault(require("styled-components"));
const viewport_context_1 = require("../app/contexts/viewport-context");
const shadow_dom_wrapper_1 = require("../app/components/shadow-dom-wrapper");
const ModalBackdrop = styled_components_1.default.div `
  background: #ffffff88;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  outline: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  z-index: 2147483647;
  visibility: visible;
`;
const Overlay = ({ children }) => {
    const { viewportRef } = (0, viewport_context_1.useViewport)();
    if (!viewportRef.current)
        return null;
    return (0, react_dom_1.createPortal)(React.createElement(shadow_dom_wrapper_1.ShadowDomWrapper, { className: "mweb-overlay" },
        React.createElement(ModalBackdrop, null, children)), viewportRef.current);
};
exports.Overlay = Overlay;
const DappletOverlay = ({ children }) => {
    const child = children.filter((c) => typeof c !== 'string' || !!c.trim())[0];
    return React.createElement(exports.Overlay, null, child);
};
exports.DappletOverlay = DappletOverlay;
