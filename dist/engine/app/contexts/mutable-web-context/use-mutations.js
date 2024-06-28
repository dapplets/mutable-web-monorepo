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
exports.useMutations = void 0;
const react_1 = require("react");
const react_2 = require("../../../../react");
const useMutations = (engine) => {
    const { core } = (0, react_2.useCore)();
    const [mutations, setMutations] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const loadMutations = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!engine)
            return;
        try {
            setIsLoading(true);
            const mutations = yield engine.mutationService.getMutationsWithSettings(core.tree);
            setMutations(mutations);
        }
        catch (err) {
            console.log(err);
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
    }), [engine, core]);
    (0, react_1.useEffect)(() => {
        loadMutations();
    }, [loadMutations]);
    return {
        mutations,
        setMutations,
        isLoading,
        error,
    };
};
exports.useMutations = useMutations;
