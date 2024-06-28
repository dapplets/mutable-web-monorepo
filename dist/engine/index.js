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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMutationApp = exports.useEditMutation = exports.useCreateMutation = exports.useMutableWeb = exports.useEngine = exports.App = exports.LocalStorage = exports.customElements = void 0;
__exportStar(require("./engine"), exports);
exports.customElements = __importStar(require("./custom-elements"));
var local_storage_1 = require("./app/services/local-db/local-storage");
Object.defineProperty(exports, "LocalStorage", { enumerable: true, get: function () { return local_storage_1.LocalStorage; } });
var app_1 = require("./app/app");
Object.defineProperty(exports, "App", { enumerable: true, get: function () { return app_1.App; } });
var engine_context_1 = require("./app/contexts/engine-context");
Object.defineProperty(exports, "useEngine", { enumerable: true, get: function () { return engine_context_1.useEngine; } });
var mutable_web_context_1 = require("./app/contexts/mutable-web-context");
Object.defineProperty(exports, "useMutableWeb", { enumerable: true, get: function () { return mutable_web_context_1.useMutableWeb; } });
Object.defineProperty(exports, "useCreateMutation", { enumerable: true, get: function () { return mutable_web_context_1.useCreateMutation; } });
Object.defineProperty(exports, "useEditMutation", { enumerable: true, get: function () { return mutable_web_context_1.useEditMutation; } });
Object.defineProperty(exports, "useMutationApp", { enumerable: true, get: function () { return mutable_web_context_1.useMutationApp; } });
