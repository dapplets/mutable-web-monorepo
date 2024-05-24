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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MutationManager_provider, _MutationManager_activeApps, _MutationManager_activeParsers;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutationManager = void 0;
const provider_1 = require("./providers/provider");
const MWebParserConfig = {
    parserType: provider_1.AdapterType.MWeb,
    id: 'mweb',
    targets: [
        {
            namespace: 'engine',
            contextType: 'website',
            if: { id: { not: null } },
        },
    ],
};
class MutationManager {
    constructor(provider) {
        this.mutation = null;
        _MutationManager_provider.set(this, void 0);
        _MutationManager_activeApps.set(this, new Map());
        _MutationManager_activeParsers.set(this, new Map());
        __classPrivateFieldSet(this, _MutationManager_provider, provider, "f");
    }
    // #region Read methods
    getAppsAndLinksForContext(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            for (const app of __classPrivateFieldGet(this, _MutationManager_activeApps, "f").values()) {
                const suitableTargets = app.targets.filter((target) => MutationManager._isTargetMet(target, context));
                if (suitableTargets.length > 0) {
                    // ToDo: batch requests
                    const targetPromises = suitableTargets.map((target) => this._getUserLinksForTarget(app.id, target, context).then((links) => (Object.assign(Object.assign({}, target), { links }))));
                    const appPromise = Promise.all(targetPromises).then((targets) => (Object.assign(Object.assign({}, app), { targets })));
                    promises.push(appPromise);
                }
            }
            const appLinksNested = yield Promise.all(promises);
            return appLinksNested;
        });
    }
    getMutationsForContext(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const mutations = yield __classPrivateFieldGet(this, _MutationManager_provider, "f").getMutations();
            return mutations.filter((mutation) => mutation.targets.some((target) => MutationManager._isTargetMet(target, context)));
        });
    }
    // ToDo: replace with getAppsAndLinksForContext
    filterSuitableApps(context, includedApps) {
        const suitableApps = [];
        const appsToCheck = includedApps
            ? Array.from(__classPrivateFieldGet(this, _MutationManager_activeApps, "f").values()).filter((app) => includedApps.includes(app.id))
            : Array.from(__classPrivateFieldGet(this, _MutationManager_activeApps, "f").values());
        for (const app of appsToCheck) {
            const suitableTargets = app.targets.filter((target) => MutationManager._isTargetMet(target, context));
            if (suitableTargets.length > 0) {
                suitableApps.push(Object.assign(Object.assign({}, app), { targets: suitableTargets }));
            }
        }
        return suitableApps;
    }
    // ToDo: replace with getAppsAndLinksForContext
    getLinksForContext(context, includedApps) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            const appsToCheck = includedApps
                ? Array.from(__classPrivateFieldGet(this, _MutationManager_activeApps, "f").values()).filter((app) => includedApps.includes(app.id))
                : Array.from(__classPrivateFieldGet(this, _MutationManager_activeApps, "f").values());
            for (const app of appsToCheck) {
                const suitableTargets = app.targets.filter((target) => MutationManager._isTargetMet(target, context));
                // ToDo: batch requests
                suitableTargets.forEach((target) => {
                    promises.push(this._getUserLinksForTarget(app.id, target, context));
                });
            }
            const appLinksNested = yield Promise.all(promises);
            return appLinksNested.flat(2);
        });
    }
    filterSuitableParsers(context) {
        const suitableParsers = [];
        for (const parser of __classPrivateFieldGet(this, _MutationManager_activeParsers, "f").values()) {
            const suitableTargets = parser.targets.filter((target) => MutationManager._isTargetMet(target, context));
            if (suitableTargets.length > 0) {
                suitableParsers.push(Object.assign(Object.assign({}, parser), { targets: suitableTargets }));
            }
        }
        return suitableParsers;
    }
    // #endregion
    // #region Write methods
    switchMutation(mutation) {
        return __awaiter(this, void 0, void 0, function* () {
            __classPrivateFieldGet(this, _MutationManager_activeApps, "f").clear();
            __classPrivateFieldGet(this, _MutationManager_activeParsers, "f").clear();
            this.mutation = null;
            if (!mutation)
                return;
            this.mutation = mutation;
            // MWeb parser is enabled by default
            __classPrivateFieldGet(this, _MutationManager_activeParsers, "f").set(MWebParserConfig.id, MWebParserConfig);
            // ToDo: it loads all parsers, need to optimize
            yield Promise.all(this.mutation.apps.map((appId) => __classPrivateFieldGet(this, _MutationManager_provider, "f")
                .getApplication(appId)
                .then((app) => { var _a; return Promise.all(((_a = app === null || app === void 0 ? void 0 : app.targets) !== null && _a !== void 0 ? _a : []).map((target) => this.loadParser(target.namespace))); })));
        });
    }
    createLink(appGlobalId, context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mutation) {
                throw new Error('Mutation is not loaded');
            }
            const app = __classPrivateFieldGet(this, _MutationManager_activeApps, "f").get(appGlobalId);
            if (!app) {
                throw new Error('App is not active');
            }
            const suitableTargets = app.targets.filter((target) => MutationManager._isTargetMet(target, context));
            if (suitableTargets.length === 0) {
                throw new Error('No suitable targets found');
            }
            if (suitableTargets.length > 1) {
                throw new Error('More than one suitable targets found');
            }
            const [target] = suitableTargets;
            const indexObject = MutationManager._buildLinkIndex(app.id, this.mutation.id, target, context);
            // ToDo: this limitation on the frontend side only
            if (target.injectOnce) {
                const existingLinks = yield __classPrivateFieldGet(this, _MutationManager_provider, "f").getLinksByIndex(indexObject);
                if (existingLinks.length > 0) {
                    throw new Error(`The widget is injected already. The "injectOnce" parameter limits multiple insertion of widgets`);
                }
            }
            const indexedLink = yield __classPrivateFieldGet(this, _MutationManager_provider, "f").createLink(indexObject);
            return {
                id: indexedLink.id,
                appId: appGlobalId,
                namespace: target.namespace,
                authorId: indexedLink.authorId,
                bosWidgetId: target.componentId,
                insertionPoint: target.injectTo,
            };
        });
    }
    deleteUserLink(userLinkId) {
        return __awaiter(this, void 0, void 0, function* () {
            return __classPrivateFieldGet(this, _MutationManager_provider, "f").deleteUserLink(userLinkId);
        });
    }
    loadApp(appId) {
        return __awaiter(this, void 0, void 0, function* () {
            // prevents racing
            if (__classPrivateFieldGet(this, _MutationManager_activeApps, "f").has(appId)) {
                return __classPrivateFieldGet(this, _MutationManager_activeApps, "f").get(appId);
            }
            const app = yield __classPrivateFieldGet(this, _MutationManager_provider, "f").getApplication(appId);
            if (!app) {
                throw new Error(`App doesn't exist: ${appId}`);
            }
            // prevents racing
            if (__classPrivateFieldGet(this, _MutationManager_activeApps, "f").has(appId)) {
                return __classPrivateFieldGet(this, _MutationManager_activeApps, "f").get(appId);
            }
            __classPrivateFieldGet(this, _MutationManager_activeApps, "f").set(app.id, app);
            console.log(`App loaded: ${appId}`);
            return app;
        });
    }
    unloadApp(appId) {
        return __awaiter(this, void 0, void 0, function* () {
            __classPrivateFieldGet(this, _MutationManager_activeApps, "f").delete(appId);
            console.log(`App unloaded: ${appId}`);
        });
    }
    loadParser(parserId) {
        return __awaiter(this, void 0, void 0, function* () {
            // prevents racing
            if (__classPrivateFieldGet(this, _MutationManager_activeParsers, "f").has(parserId)) {
                return __classPrivateFieldGet(this, _MutationManager_activeParsers, "f").get(parserId);
            }
            const parser = yield __classPrivateFieldGet(this, _MutationManager_provider, "f").getParserConfig(parserId);
            if (!parser) {
                throw new Error(`Parser doesn't exist: ${parserId}`);
            }
            // prevents racing
            if (__classPrivateFieldGet(this, _MutationManager_activeParsers, "f").has(parserId)) {
                return __classPrivateFieldGet(this, _MutationManager_activeParsers, "f").get(parserId);
            }
            __classPrivateFieldGet(this, _MutationManager_activeParsers, "f").set(parser.id, parser);
            // console.log(`Parser loaded: ${parser.id}`)
            return parser;
        });
    }
    unloadParser(parserId) {
        return __awaiter(this, void 0, void 0, function* () {
            __classPrivateFieldGet(this, _MutationManager_activeParsers, "f").delete(parserId);
            console.log(`Parser unloaded: ${parserId}`);
        });
    }
    // #endregion
    // #region Private
    _getUserLinksForTarget(appId, target, context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mutation)
                throw new Error('Mutation is not loaded');
            const indexObject = MutationManager._buildLinkIndex(appId, this.mutation.id, target, context);
            const indexedLinks = yield __classPrivateFieldGet(this, _MutationManager_provider, "f").getLinksByIndex(indexObject);
            return indexedLinks.map((link) => ({
                id: link.id,
                appId: appId,
                authorId: link.authorId,
                namespace: target.namespace,
                bosWidgetId: target.componentId, // ToDo: unify
                insertionPoint: target.injectTo, // ToDo: unify
            }));
        });
    }
    // #endregion
    // #region Utils
    static _buildLinkIndex(appId, mutationId, target, context) {
        const indexedContextData = this._buildIndexedContextValues(target.if, context.parsedContext);
        return {
            appId,
            mutationId,
            namespace: target.namespace,
            contextType: target.contextType,
            if: indexedContextData,
        };
    }
    static _buildIndexedContextValues(conditions, values) {
        const object = {};
        for (const property in conditions) {
            if (conditions[property].index) {
                object[property] = values[property];
            }
        }
        return object;
    }
    static _isTargetMet(target, context) {
        // ToDo: check insertion points?
        return (target.namespace === context.namespace &&
            target.contextType === context.contextType &&
            this._areConditionsMet(target.if, context.parsedContext));
    }
    static _areConditionsMet(conditions, values) {
        for (const property in conditions) {
            if (!this._isConditionMet(conditions[property], values[property])) {
                return false;
            }
        }
        return true;
    }
    static _isConditionMet(condition, value) {
        const { not: _not, eq: _eq, contains: _contains, in: _in, endsWith: _endsWith } = condition;
        if (_not !== undefined) {
            return _not !== value;
        }
        if (_eq !== undefined) {
            return _eq === value;
        }
        if (_contains !== undefined && typeof value === 'string') {
            return value.includes(_contains);
        }
        if (_endsWith !== undefined && typeof value === 'string') {
            return value.endsWith(_endsWith);
        }
        if (_in !== undefined) {
            return _in.includes(value);
        }
        return false;
    }
}
exports.MutationManager = MutationManager;
_MutationManager_provider = new WeakMap(), _MutationManager_activeApps = new WeakMap(), _MutationManager_activeParsers = new WeakMap();
