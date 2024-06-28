"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useContextApps = void 0;
const react_1 = require("react");
const use_mutable_web_1 = require("./use-mutable-web");
const useContextApps = (context) => {
    const { engine, activeApps } = (0, use_mutable_web_1.useMutableWeb)();
    const apps = (0, react_1.useMemo)(() => engine.applicationService.filterSuitableApps(activeApps, context), [engine, activeApps, context]);
    // ToDo: implement injectOnce
    // ToDo: update if new apps enabled
    return { apps };
};
exports.useContextApps = useContextApps;
