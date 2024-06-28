"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutableWebContext = exports.contextDefaultValues = void 0;
const react_1 = require("react");
exports.contextDefaultValues = {
    engine: null, // ToDo
    mutations: [],
    allApps: [],
    mutationApps: [],
    activeApps: [],
    isLoading: false,
    selectedMutation: null,
    switchMutation: () => undefined,
    favoriteMutationId: null,
    setFavoriteMutation: () => undefined,
    removeMutationFromRecents: () => undefined,
    setMutations: () => undefined,
    setMutationApps: () => undefined,
};
exports.MutableWebContext = (0, react_1.createContext)(exports.contextDefaultValues);
