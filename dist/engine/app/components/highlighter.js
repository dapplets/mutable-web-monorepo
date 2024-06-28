"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Highlighter = void 0;
const react_1 = __importDefault(require("react"));
const lightning_1 = __importDefault(require("./assets/icons/lightning"));
const DEFAULT_BORDER_RADIUS = 6; // px
const DEFAULT_BORDER_COLOR = '#384BFF'; // blue
const DEFAULT_INACTIVE_BORDER_COLOR = '#384BFF4D'; // light blue // ToDo: duplicated: picker-highlighter.tsx
const DEFAULT_BORDER_STYLE = 'solid';
const DEFAULT_BORDER_WIDTH = 2; //px
const DEFAULT_BACKGROUND_COLOR = 'rgb(56 188 255 / 5%)'; // light light blue
const Highlighter = ({ el, styles, isFilled, children, action, variant, }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const bodyOffset = document.documentElement.getBoundingClientRect();
    const targetOffset = el.getBoundingClientRect();
    const backgroundColor = isFilled
        ? (_a = styles.backgroundColor) !== null && _a !== void 0 ? _a : DEFAULT_BACKGROUND_COLOR
        : 'transparent';
    const borderWidth = (_b = styles.borderWidth) !== null && _b !== void 0 ? _b : DEFAULT_BORDER_WIDTH;
    const borderStyle = (_c = styles.borderStyle) !== null && _c !== void 0 ? _c : DEFAULT_BORDER_STYLE;
    const borderColor = (_d = styles.borderColor) !== null && _d !== void 0 ? _d : DEFAULT_BORDER_COLOR;
    const border = (_e = styles.border) !== null && _e !== void 0 ? _e : `${borderWidth}px ${borderStyle} ${borderColor}`;
    const zIndex = (_f = styles.zIndex) !== null && _f !== void 0 ? _f : 10000000; // ToDo: rethink it
    const borderRadius = (_g = styles.borderRadius) !== null && _g !== void 0 ? _g : DEFAULT_BORDER_RADIUS;
    if (!isFilled) {
        const wrapperStyle = {
            transition: 'all .2s ease-in-out',
            opacity: styles.opacity,
        };
        const borderWidth = (_h = styles.borderWidth) !== null && _h !== void 0 ? _h : DEFAULT_BORDER_WIDTH;
        const topStyle = {
            left: targetOffset.left - bodyOffset.left + borderWidth * 2,
            top: targetOffset.top - 1 - bodyOffset.top,
            width: targetOffset.width - borderRadius - borderWidth,
            height: borderWidth,
            position: 'absolute',
            zIndex,
            borderTop: border,
        };
        const bottomStyle = {
            left: targetOffset.left - bodyOffset.left + borderWidth * 2,
            top: targetOffset.top + targetOffset.height - 1 - bodyOffset.top,
            width: targetOffset.width - borderRadius - borderWidth,
            height: borderWidth,
            position: 'absolute',
            zIndex,
            borderBottom: border,
        };
        const leftStyle = {
            left: targetOffset.left - bodyOffset.left - borderWidth,
            top: targetOffset.top - 1 - bodyOffset.top,
            height: targetOffset.height + borderWidth,
            width: borderRadius,
            position: 'absolute',
            zIndex,
            borderLeft: border,
            borderTop: border,
            borderBottom: border,
            borderRadius: `${borderRadius}px 0 0 ${borderRadius}px`,
        };
        const rightStyle = {
            left: targetOffset.left + targetOffset.width - bodyOffset.left - borderWidth * 2,
            top: targetOffset.top - 1 - bodyOffset.top,
            height: targetOffset.height + borderWidth,
            width: borderRadius,
            position: 'absolute',
            zIndex,
            borderRight: border,
            borderTop: border,
            borderBottom: border,
            borderRadius: `0 ${borderRadius}px ${borderRadius}px 0`,
        };
        return (react_1.default.createElement("div", { style: wrapperStyle, className: "mweb-highlighter" },
            react_1.default.createElement("div", { style: topStyle }),
            react_1.default.createElement("div", { style: leftStyle }),
            react_1.default.createElement("div", { style: rightStyle }),
            react_1.default.createElement("div", { style: bottomStyle })));
    }
    const wrapperStyle = {
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        top: targetOffset.top - bodyOffset.top,
        left: targetOffset.left - bodyOffset.left,
        width: targetOffset.width,
        height: targetOffset.height,
        borderRadius: borderRadius,
        border,
        transition: 'all .2s ease-in-out',
        cursor: ((_j = styles.cursor) !== null && _j !== void 0 ? _j : action) ? 'pointer' : 'default',
        zIndex,
        opacity: styles.opacity,
        backgroundColor,
    };
    return (react_1.default.createElement("div", { style: wrapperStyle, className: "mweb-highlighter", onClick: action }, children && (!Array.isArray(children) || children.length) ? (react_1.default.createElement("div", { style: { opacity: !variant || variant === 'current' ? 1 : 0.5 } }, children)) : (react_1.default.createElement(lightning_1.default, { color: !variant || variant === 'current' ? DEFAULT_BORDER_COLOR : DEFAULT_INACTIVE_BORDER_COLOR }))));
};
exports.Highlighter = Highlighter;
