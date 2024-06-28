"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePortals = void 0;
const react_1 = require("react");
const usePortals = () => {
    const [portals, setPortals] = (0, react_1.useState)(new Map());
    const addPortal = (0, react_1.useCallback)((key, target, component) => {
        setPortals((prev) => new Map(prev.set(key, { component: component, target })));
    }, []);
    const removePortal = (0, react_1.useCallback)((key) => {
        setPortals((prev) => {
            prev.delete(key);
            return new Map(prev);
        });
    }, []);
    return {
        portals,
        addPortal,
        removePortal,
    };
};
exports.usePortals = usePortals;
