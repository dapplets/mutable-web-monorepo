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
exports.PickerHighlighter = void 0;
const react_1 = __importStar(require("react"));
const server_1 = __importDefault(require("react-dom/server"));
const utils_1 = require("../../../core/utils");
const highlighter_1 = require("./highlighter");
const DEFAULT_INACTIVE_BORDER_COLOR = '#384BFF4D'; // light blue
const DEFAULT_CHILDREN_BORDER_STYLE = 'dashed';
const PRIVILEGED_NAMESPACE = 'mweb'; // ToDo: hardcode. Needs to be fixed.
const PickerHighlighter = ({ focusedContext, context, onMouseEnter, onMouseLeave, styles, onClick, highlightChildren, variant, LatchComponent, children, }) => {
    var _a, _b, _c;
    const pickerRef = (0, react_1.useRef)(null);
    const bodyOffset = document.documentElement.getBoundingClientRect();
    const targetOffset = (_a = context.element) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
    const hasLatch = (0, react_1.useMemo)(() => LatchComponent
        ? !!server_1.default.renderToStaticMarkup(react_1.default.createElement(LatchComponent, { context: context, variant: "current", contextDimensions: {
                width: (targetOffset === null || targetOffset === void 0 ? void 0 : targetOffset.width) || 0,
                height: (targetOffset === null || targetOffset === void 0 ? void 0 : targetOffset.height) || 0,
            } })).trim()
        : false, [context]);
    (0, react_1.useEffect)(() => {
        var _a, _b;
        if (hasLatch) {
            (_a = context.element) === null || _a === void 0 ? void 0 : _a.addEventListener('mouseenter', onMouseEnter);
            (_b = context.element) === null || _b === void 0 ? void 0 : _b.addEventListener('mouseleave', onMouseLeave);
        }
        if (!pickerRef.current)
            return;
        pickerRef.current.addEventListener('mouseenter', onMouseEnter);
        pickerRef.current.addEventListener('mouseleave', onMouseLeave);
        return () => {
            var _a, _b;
            if (hasLatch) {
                (_a = context.element) === null || _a === void 0 ? void 0 : _a.removeEventListener('mouseenter', onMouseEnter);
                (_b = context.element) === null || _b === void 0 ? void 0 : _b.removeEventListener('mouseleave', onMouseLeave);
            }
            if (!pickerRef.current)
                return;
            pickerRef.current.removeEventListener('mouseenter', onMouseEnter);
            pickerRef.current.removeEventListener('mouseleave', onMouseLeave);
        };
    }, [pickerRef.current]);
    if (!context.element || !targetOffset)
        return null;
    const isFirstLevelContext = !context.parentNode || context.parentNode.contextType === 'root';
    const contextDepth = (0, utils_1.getContextDepth)(context);
    const backgroundColor = onClick ? styles === null || styles === void 0 ? void 0 : styles.backgroundColor : 'transparent';
    const opacity = variant === 'current' ||
        (variant && highlightChildren) ||
        (!focusedContext && isFirstLevelContext)
        ? 1
        : 0;
    const borderWidth = styles === null || styles === void 0 ? void 0 : styles.borderWidth;
    const borderStyle = ((_b = styles === null || styles === void 0 ? void 0 : styles.borderStyle) !== null && _b !== void 0 ? _b : !isFirstLevelContext) ? DEFAULT_CHILDREN_BORDER_STYLE : undefined;
    const borderColor = ((_c = styles === null || styles === void 0 ? void 0 : styles.borderColor) !== null && _c !== void 0 ? _c : variant !== 'current') ? DEFAULT_INACTIVE_BORDER_COLOR : undefined;
    const zIndex = 1000 * (context.namespace === PRIVILEGED_NAMESPACE ? 10 : 1) + (contextDepth !== null && contextDepth !== void 0 ? contextDepth : 0);
    const doShowLatch = LatchComponent && (variant === 'current' || variant === 'parent');
    return (react_1.default.createElement("div", { className: "mweb-picker", ref: pickerRef },
        doShowLatch ? (react_1.default.createElement("div", { style: {
                position: 'absolute',
                left: targetOffset.left + 2 - bodyOffset.left,
                top: targetOffset.top - 1 - bodyOffset.top,
                zIndex: zIndex + 1,
            } },
            react_1.default.createElement(LatchComponent, { context: context, variant: variant, contextDimensions: {
                    width: targetOffset.width,
                    height: targetOffset.height,
                } }))) : null,
        react_1.default.createElement(highlighter_1.Highlighter, { el: context.element, styles: Object.assign(Object.assign({}, styles), { backgroundColor,
                borderWidth,
                borderStyle,
                borderColor,
                zIndex,
                opacity }), isFilled: !hasLatch, children: children, variant: variant !== null && variant !== void 0 ? variant : 'parent', action: onClick })));
};
exports.PickerHighlighter = PickerHighlighter;
