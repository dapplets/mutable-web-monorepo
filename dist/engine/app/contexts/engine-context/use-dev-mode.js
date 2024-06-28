"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDevMode = void 0;
const react_1 = require("react");
const dev_server_service_1 = require("../../services/dev-server-service");
const json_stringify_deterministic_1 = __importDefault(require("json-stringify-deterministic"));
const DevModeUpdateInterval = 1500;
const useDevMode = () => {
    const [redirectMap, setRedirectMap] = (0, react_1.useState)(null);
    const [isDevMode, setIsDevMode] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (!isDevMode) {
            setRedirectMap(null);
            return;
        }
        let isMount = true;
        const timer = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
            const newRedirectMap = yield (0, dev_server_service_1.getRedirectMap)();
            if (!isMount)
                return;
            // prevents rerendering
            setRedirectMap((prev) => (0, json_stringify_deterministic_1.default)(prev) !== (0, json_stringify_deterministic_1.default)(newRedirectMap) ? newRedirectMap : prev);
        }), DevModeUpdateInterval);
        return () => {
            isMount = false;
            clearInterval(timer);
        };
    }, [isDevMode]);
    const enableDevMode = (0, react_1.useCallback)(() => {
        setIsDevMode(true);
    }, []);
    const disableDevMode = (0, react_1.useCallback)(() => {
        setIsDevMode(false);
    }, []);
    return {
        redirectMap,
        enableDevMode,
        disableDevMode,
    };
};
exports.useDevMode = useDevMode;
