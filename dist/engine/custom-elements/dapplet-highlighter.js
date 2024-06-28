"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DappletHighlighter = void 0;
const react_1 = __importDefault(require("react"));
const highlighter_context_1 = require("../app/contexts/highlighter-context");
const _DappletHighlighter = ({ target, styles, filled, icon, action }) => {
    const { setHighlighterTask } = (0, highlighter_context_1.useHighlighter)();
    react_1.default.useEffect(() => {
        setHighlighterTask({
            target,
            styles,
            isFilled: filled,
            icon,
            action,
        });
        return () => setHighlighterTask(null);
    }, [target, styles, filled, icon, action]);
    return null;
};
const DappletHighlighter = (props) => {
    return react_1.default.createElement(_DappletHighlighter, Object.assign({}, props));
};
exports.DappletHighlighter = DappletHighlighter;
