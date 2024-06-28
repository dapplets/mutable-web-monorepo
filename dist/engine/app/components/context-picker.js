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
exports.ContextPicker = void 0;
const react_1 = __importStar(require("react"));
const react_2 = require("../../../react");
const picker_highlighter_1 = require("./picker-highlighter");
const target_service_1 = require("../services/target/target.service");
const picker_context_1 = require("../contexts/picker-context");
const ContextPicker = () => {
    const { tree } = (0, react_2.useCore)();
    const { pickerTask } = (0, picker_context_1.usePicker)();
    const [focusedContext, setFocusedContext] = (0, react_1.useState)(null);
    if (!tree || !pickerTask)
        return null;
    return (react_1.default.createElement(react_2.ContextTree, null, ({ context }) => {
        const isSuitable = (0, react_1.useMemo)(() => { var _a, _b; return (_b = (_a = pickerTask.target) === null || _a === void 0 ? void 0 : _a.some((t) => target_service_1.TargetService.isTargetMet(t, context))) !== null && _b !== void 0 ? _b : true; }, [pickerTask, context]);
        if (!isSuitable)
            return null;
        const variant = (0, react_1.useMemo)(() => {
            if (focusedContext === context)
                return 'current';
            if (focusedContext === context.parentNode)
                return 'child';
            if (focusedContext && context.children.includes(focusedContext))
                return 'parent';
        }, [focusedContext, context]);
        const handleClick = (0, react_1.useCallback)(() => {
            var _a;
            (_a = pickerTask.onClick) === null || _a === void 0 ? void 0 : _a.call(pickerTask, context);
        }, [pickerTask, context]);
        const handleMouseEnter = (0, react_1.useCallback)(() => {
            setFocusedContext(context);
        }, [context]);
        const handleMouseLeave = (0, react_1.useCallback)(() => {
            setFocusedContext(null);
        }, [context]);
        return (react_1.default.createElement(picker_highlighter_1.PickerHighlighter, { focusedContext: focusedContext, context: context, variant: variant, onClick: handleClick, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, highlightChildren: true, LatchComponent: pickerTask.LatchComponent }));
    }));
};
exports.ContextPicker = ContextPicker;
