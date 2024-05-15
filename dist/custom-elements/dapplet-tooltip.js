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
exports.DappletTooltip = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const ShowDelay = 300;
exports.DappletTooltip = react_1.default.forwardRef((_a, ref) => {
    var { children } = _a, attributes = __rest(_a, ["children"]);
    const innerRef = (0, react_1.useRef)(null);
    (0, react_1.useImperativeHandle)(ref, () => innerRef.current, []);
    (0, react_1.useEffect)(() => {
        if (!innerRef.current)
            return;
        if (attributes.hasDoneInitialMeasure) {
            const timer = setTimeout(() => {
                if (!innerRef.current)
                    return;
                innerRef.current.style.visibility = '';
                innerRef.current.style.opacity = '1';
            }, ShowDelay);
            return () => clearTimeout(timer);
        }
        else {
            innerRef.current.style.visibility = 'hidden';
            innerRef.current.style.opacity = '0';
        }
    }, [attributes.hasDoneInitialMeasure, innerRef]);
    return (react_1.default.createElement(react_bootstrap_1.Tooltip, Object.assign({}, attributes, { ref: innerRef }), children));
});
