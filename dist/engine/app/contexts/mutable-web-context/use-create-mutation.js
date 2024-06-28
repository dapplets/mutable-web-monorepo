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
exports.useCreateMutation = void 0;
const react_1 = require("react");
const mutable_web_context_1 = require("./mutable-web-context");
function useCreateMutation() {
    const { engine, setMutations } = (0, react_1.useContext)(mutable_web_context_1.MutableWebContext);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const createMutation = (creatingMutation) => __awaiter(this, void 0, void 0, function* () {
        try {
            setIsLoading(true);
            const createdMutation = yield engine.mutationService.createMutation(creatingMutation);
            setMutations((mutations) => [...mutations, createdMutation]);
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
    });
    return { createMutation, isLoading, error };
}
exports.useCreateMutation = useCreateMutation;
