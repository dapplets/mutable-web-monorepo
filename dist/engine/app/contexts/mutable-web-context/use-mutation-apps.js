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
exports.useMutationApps = void 0;
const react_1 = require("react");
const useMutationApps = (engine, mutation) => {
    const [mutationApps, setMutationApps] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const loadMutationApps = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!mutation) {
            setMutationApps([]);
            return;
        }
        try {
            setIsLoading(true);
            // ToDo: move to service
            const apps = yield Promise.all(mutation.apps.map((appId) => engine.applicationService
                .getApplication(appId)
                .then((appMetadata) => appMetadata
                ? engine.applicationService.populateAppWithSettings(mutation.id, appMetadata)
                : null))).then((apps) => apps.filter((app) => app !== null));
            setMutationApps(apps);
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
    }), [engine, mutation]);
    (0, react_1.useEffect)(() => {
        loadMutationApps();
    }, [loadMutationApps]);
    return {
        mutationApps,
        setMutationApps,
        isLoading,
        error,
    };
};
exports.useMutationApps = useMutationApps;
