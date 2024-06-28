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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMutationParsers = void 0;
const react_1 = require("react");
const useMutationParsers = (engine, apps) => {
    const [parserConfigs, setParserConfigs] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const loadMutationParsers = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setIsLoading(true);
            // ToDo: move to service
            const uniqueNamespaces = Array.from(new Set(apps
                .map((app) => { var _a; return (_a = app.targets) === null || _a === void 0 ? void 0 : _a.map((target) => target.namespace); })
                .flat()
                .filter((ns) => !!ns)));
            const parserConfigs = (yield Promise.all(uniqueNamespaces.map((ns) => engine.parserConfigService.getParserConfig(ns)))).filter((pc) => pc !== null);
            setParserConfigs(parserConfigs);
        }
        catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
            else {
                setError('Unknown error');
            }
        }
        finally {
            setIsLoading(false);
        }
    }), [engine, apps]);
    (0, react_1.useEffect)(() => {
        loadMutationParsers();
    }, [loadMutationParsers]);
    return {
        parserConfigs,
        isLoading,
        error,
    };
};
exports.useMutationParsers = useMutationParsers;
