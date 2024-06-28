"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextHighlighter = void 0;
const react_1 = __importDefault(require("react"));
const react_2 = require("../../../react");
const target_service_1 = require("../services/target/target.service");
const highlighter_context_1 = require("../contexts/highlighter-context");
const highlighter_1 = require("./highlighter");
const ContextHighlighter = () => {
    const { tree } = (0, react_2.useCore)();
    const { highlighterTask } = (0, highlighter_context_1.useHighlighter)();
    if (!tree || !highlighterTask)
        return null;
    return (react_1.default.createElement(react_2.ContextTree, null, ({ context }) => {
        const isSuitable = (highlighterTask === null || highlighterTask === void 0 ? void 0 : highlighterTask.target)
            ? Array.isArray(highlighterTask.target)
                ? highlighterTask.target
                    .map((t) => target_service_1.TargetService.isTargetMet(t, context))
                    .includes(true)
                : target_service_1.TargetService.isTargetMet(highlighterTask.target, context)
            : true;
        return isSuitable && context.element ? (react_1.default.createElement(highlighter_1.Highlighter, { el: context.element, styles: Object.assign(Object.assign({}, highlighterTask.styles), { opacity: 1 }), isFilled: highlighterTask.isFilled, children: highlighterTask.icon, action: highlighterTask.action })) : null;
    }));
};
exports.ContextHighlighter = ContextHighlighter;
