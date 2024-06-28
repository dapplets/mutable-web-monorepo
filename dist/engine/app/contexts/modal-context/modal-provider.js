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
exports.ModalProvider = void 0;
const react_1 = __importStar(require("react"));
const modal_context_1 = require("./modal-context");
const antd_1 = require("antd");
const viewport_context_1 = require("../viewport-context");
const ModalProvider = ({ children }) => {
    const { viewportRef } = (0, viewport_context_1.useViewport)();
    const counterRef = (0, react_1.useRef)(0);
    const [api, contextHolder] = antd_1.notification.useNotification({
        getContainer: () => {
            if (!viewportRef.current)
                throw new Error('Viewport is not initialized');
            return viewportRef.current;
        },
    });
    const notify = (0, react_1.useCallback)((modalProps) => {
        if (!Object.values(modal_context_1.NotificationType).includes(modalProps.type)) {
            console.error('Unknown notification type: ' + modalProps.type);
            return;
        }
        const modalId = counterRef.current++;
        api[modalProps.type]({
            key: modalId,
            message: modalProps.subject,
            description: modalProps.body,
            placement: 'bottomRight',
            duration: null,
            btn: modalProps.actions && modalProps.actions.length
                ? modalProps.actions.map((action, i) => {
                    var _a;
                    return (react_1.default.createElement(antd_1.Space, { key: i, style: { marginRight: '10px', marginBottom: '10px' } },
                        react_1.default.createElement(antd_1.Button, { type: (_a = action.type) !== null && _a !== void 0 ? _a : 'primary', size: "small", onClick: () => {
                                var _a;
                                (_a = action.onClick) === null || _a === void 0 ? void 0 : _a.call(action);
                                api.destroy(modalId);
                            } }, action.label)));
                })
                : null,
        });
    }, [api]);
    const state = {
        notify,
    };
    return (react_1.default.createElement(modal_context_1.ModalContext.Provider, { value: state },
        react_1.default.createElement(react_1.default.Fragment, null, contextHolder),
        react_1.default.createElement(react_1.default.Fragment, null, children)));
};
exports.ModalProvider = ModalProvider;
