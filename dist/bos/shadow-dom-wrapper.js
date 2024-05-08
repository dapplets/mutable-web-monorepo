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
exports.ShadowDomWrapper = void 0;
const React = __importStar(require("react"));
const react_dom_1 = require("react-dom");
const styled_components_1 = require("styled-components");
exports.ShadowDomWrapper = React.forwardRef(({ children, stylesheetSrc }, ref) => {
    const myRef = React.useRef(null);
    const [root, setRoot] = React.useState(null);
    // ToDo: to make sure that when stylesheetSrc changes, it doesn't get executed multiple times
    React.useLayoutEffect(() => {
        if (myRef.current) {
            const EventsToStopPropagation = ['click', 'keydown', 'keyup', 'keypress'];
            const shadowRoot = myRef.current.attachShadow({ mode: 'closed' });
            const stylesMountPoint = document.createElement('div');
            const container = document.createElement('div');
            shadowRoot.appendChild(stylesMountPoint);
            // It will prevent inheritance without affecting other CSS defined within the ShadowDOM.
            // https://stackoverflow.com/a/68062098
            const resetCssRules = `
            :host { 
            all: initial; 
            display: flex; 
            align-items: center;
            justify-content: center;
            position: relative;
            visibility: visible !important;
            }
        `;
            const disableCssInheritanceStyle = document.createElement('style');
            disableCssInheritanceStyle.innerHTML = resetCssRules;
            shadowRoot.appendChild(disableCssInheritanceStyle);
            if (stylesheetSrc) {
                const externalStylesLink = document.createElement('link');
                externalStylesLink.rel = 'stylesheet';
                externalStylesLink.href = stylesheetSrc;
                shadowRoot.appendChild(externalStylesLink);
                // ToDo: parametrize this bootstrap specific code
                container.setAttribute('data-bs-theme', 'light');
            }
            // For mweb parser that looks for contexts in shadow dom
            myRef.current.setAttribute('data-mweb-shadow-host', '');
            // Context cannot be a shadow root node because mutation observer doesn't work there
            // So we need to select a child node for context
            container.setAttribute('data-mweb-context-type', 'shadow-dom');
            shadowRoot.appendChild(container);
            // Prevent event propagation from BOS-component to parent
            EventsToStopPropagation.forEach((eventName) => {
                myRef.current.addEventListener(eventName, (e) => e.stopPropagation());
            });
            setRoot({ container, stylesMountPoint });
        }
        else {
            setRoot(null);
        }
    }, [myRef, stylesheetSrc]);
    return (React.createElement("div", { ref: (node) => {
            myRef.current = node;
            if (typeof ref === 'function') {
                ref(node);
            }
            else if (ref) {
                ref.current = node;
            }
        } }, root && children
        ? (0, react_dom_1.createPortal)(React.createElement(styled_components_1.StyleSheetManager, { target: root.stylesMountPoint }, children), root.container)
        : null));
});
exports.ShadowDomWrapper.displayName = 'ShadowDomWrapper';
