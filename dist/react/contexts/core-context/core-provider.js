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
exports.CoreProvider = void 0;
const react_1 = __importStar(require("react"));
const core_context_1 = require("./core-context");
const core_1 = require("../../../core");
const CoreProvider = ({ children }) => {
    const coreRef = (0, react_1.useRef)(null);
    if (!coreRef.current) {
        coreRef.current = new core_1.Core();
    }
    const core = coreRef.current;
    const attachParserConfig = (0, react_1.useCallback)((parserConfig) => {
        core.attachParserConfig(parserConfig);
    }, [core]);
    const detachParserConfig = (0, react_1.useCallback)((parserId) => {
        core.detachParserConfig(parserId);
    }, [core]);
    const updateRootContext = (0, react_1.useCallback)((rootParsedContext = {}) => {
        core.updateRootContext(rootParsedContext);
    }, [core]);
    const state = {
        core,
        tree: core.tree,
        attachParserConfig,
        detachParserConfig,
        updateRootContext,
    };
    return react_1.default.createElement(core_context_1.CoreContext.Provider, { value: state }, children);
};
exports.CoreProvider = CoreProvider;
