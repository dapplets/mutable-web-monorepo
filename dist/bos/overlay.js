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
Object.defineProperty(exports, "__esModule", { value: true });
exports.shadowRoot = exports.Overlay = void 0;
const React = __importStar(require("react"));
const react_dom_1 = require("react-dom");
const styled_components_1 = require("styled-components");
const EventsToStopPropagation = ['click', 'keydown', 'keyup', 'keypress'];
const overlay = document.createElement('mutable-web-overlay');
overlay.style.background = '#ffffff88';
overlay.style.position = 'fixed';
overlay.style.display = 'none';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.height = '100%';
overlay.style.overflowX = 'hidden';
overlay.style.overflowY = 'auto';
overlay.style.outline = '0';
overlay.style.fontFamily =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
overlay.style.zIndex = '2147483647';
overlay.style.visibility = 'visible';
const shadowRoot = overlay.attachShadow({ mode: 'closed' });
exports.shadowRoot = shadowRoot;
const stylesMountPoint = document.createElement('div');
const container = document.createElement('div');
shadowRoot.appendChild(stylesMountPoint);
// It will prevent inheritance without affecting other CSS defined within the ShadowDOM.
// https://stackoverflow.com/a/68062098
const disableCssInheritanceStyle = document.createElement('style');
disableCssInheritanceStyle.innerHTML = ':host { all: initial; }';
shadowRoot.appendChild(disableCssInheritanceStyle);
shadowRoot.appendChild(container);
// Prevent event propagation from BOS-component to parent
EventsToStopPropagation.forEach((eventName) => {
    overlay.addEventListener(eventName, (e) => e.stopPropagation());
});
document.body.appendChild(overlay);
const Overlay = ({ children }) => {
    React.useEffect(() => {
        overlay.style.display = 'block';
        return () => {
            overlay.style.display = 'none';
        };
    }, []);
    return (0, react_dom_1.createPortal)(React.createElement(styled_components_1.StyleSheetManager, { target: stylesMountPoint }, children), container);
};
exports.Overlay = Overlay;
