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
exports.EngineProvider = void 0;
const react_1 = __importStar(require("react"));
const engine_context_1 = require("./engine-context");
const use_portals_1 = require("./use-portals");
const use_dev_mode_1 = require("./use-dev-mode");
const EngineProvider = ({ children }) => {
    const { portals, addPortal, removePortal } = (0, use_portals_1.usePortals)();
    const { redirectMap, enableDevMode, disableDevMode } = (0, use_dev_mode_1.useDevMode)();
    (0, react_1.useEffect)(() => {
        console.log('[MutableWeb] Dev mode:', {
            enableDevMode,
            disableDevMode,
        });
    }, [enableDevMode, disableDevMode]);
    const state = {
        portals,
        addPortal,
        removePortal,
        redirectMap,
        enableDevMode,
        disableDevMode,
    };
    return react_1.default.createElement(engine_context_1.EngineContext.Provider, { value: state }, children);
};
exports.EngineProvider = EngineProvider;
