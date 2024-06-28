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
exports.App = void 0;
const react_1 = __importStar(require("react"));
const react_2 = require("../../react");
const engine_context_1 = require("./contexts/engine-context");
const mutable_web_context_1 = require("./contexts/mutable-web-context");
const viewport_context_1 = require("./contexts/viewport-context");
const context_picker_1 = require("./components/context-picker");
const context_manager_1 = require("./components/context-manager");
const modal_context_1 = require("./contexts/modal-context");
const picker_context_1 = require("./contexts/picker-context");
const context_highlighter_1 = require("./components/context-highlighter");
const highlighter_context_1 = require("./contexts/highlighter-context");
const App = ({ config, defaultMutationId, children }) => {
    return (react_1.default.createElement(viewport_context_1.ViewportProvider, { stylesheetSrc: config.bosElementStyleSrc },
        react_1.default.createElement(modal_context_1.ModalProvider, null,
            react_1.default.createElement(react_2.CoreProvider, null,
                react_1.default.createElement(engine_context_1.EngineProvider, null,
                    react_1.default.createElement(picker_context_1.PickerProvider, null,
                        react_1.default.createElement(highlighter_context_1.HighlighterProvider, null,
                            react_1.default.createElement(mutable_web_context_1.MutableWebProvider, { config: config, defaultMutationId: defaultMutationId },
                                react_1.default.createElement(context_picker_1.ContextPicker, null),
                                react_1.default.createElement(context_manager_1.ContextManager, null),
                                react_1.default.createElement(context_highlighter_1.ContextHighlighter, null),
                                react_1.default.createElement(react_1.Fragment, null, children)))))))));
};
exports.App = App;
