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
exports.useUserLinks = void 0;
const react_1 = require("react");
const _1 = require(".");
const useUserLinks = (context) => {
    const { engine, selectedMutation, activeApps } = (0, _1.useMutableWeb)();
    const [userLinks, setUserLinks] = (0, react_1.useState)([]);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchUserLinks = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!engine || !(selectedMutation === null || selectedMutation === void 0 ? void 0 : selectedMutation.id)) {
            setUserLinks([]);
            return;
        }
        try {
            const links = yield engine.userLinkService.getLinksForContext(activeApps, selectedMutation.id, context);
            setUserLinks(links);
        }
        catch (err) {
            if (err instanceof Error) {
                setError(err);
            }
            else {
                setError(new Error('An unknown error occurred'));
            }
        }
    }), [engine, selectedMutation, activeApps, context]);
    (0, react_1.useEffect)(() => {
        fetchUserLinks();
    }, [fetchUserLinks]);
    const createUserLink = (0, react_1.useCallback)((appId) => __awaiter(void 0, void 0, void 0, function* () {
        if (!engine || !(selectedMutation === null || selectedMutation === void 0 ? void 0 : selectedMutation.id)) {
            throw new Error('No mutation selected');
        }
        try {
            const createdLink = yield engine.userLinkService.createLink(selectedMutation.id, appId, context);
            setUserLinks((prev) => [...prev, createdLink]);
        }
        catch (err) {
            console.error(err);
        }
    }), [engine, selectedMutation, context]);
    const deleteUserLink = (0, react_1.useCallback)((linkId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield engine.userLinkService.deleteUserLink(linkId);
            setUserLinks((prev) => prev.filter((link) => link.id !== linkId));
        }
        catch (err) {
            console.error(err);
        }
    }), [engine]);
    return { userLinks, createUserLink, deleteUserLink, error };
};
exports.useUserLinks = useUserLinks;
