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
var _Engine_provider, _Engine_bosWidgetFactory, _Engine_selector, _Engine_contextManagers, _Engine_mutationManager, _Engine_nearConfig, _Engine_redirectMap, _Engine_devModePollingTimer, _Engine_repository, _Engine_viewport, _Engine_refComponents;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = exports.engineSingleton = void 0;
const dynamic_html_adapter_1 = require("./core/adapters/dynamic-html-adapter");
const bos_widget_factory_1 = require("./bos/bos-widget-factory");
const provider_1 = require("./providers/provider");
const constants_1 = require("./constants");
const near_signer_1 = require("./providers/near-signer");
const social_db_provider_1 = require("./providers/social-db-provider");
const pure_tree_builder_1 = require("./core/tree/pure-tree/pure-tree-builder");
const context_manager_1 = require("./context-manager");
const mutation_manager_1 = require("./mutation-manager");
const json_parser_1 = require("./core/parsers/json-parser");
const bos_parser_1 = require("./core/parsers/bos-parser");
const mweb_parser_1 = require("./core/parsers/mweb-parser");
const pure_context_node_1 = require("./core/tree/pure-tree/pure-context-node");
const repository_1 = require("./storage/repository");
const json_storage_1 = require("./storage/json-storage");
const local_storage_1 = require("./storage/local-storage");
// ToDo: dirty hack
exports.engineSingleton = null;
class Engine {
    constructor(config) {
        var _a;
        this.config = config;
        _Engine_provider.set(this, void 0);
        _Engine_bosWidgetFactory.set(this, void 0);
        _Engine_selector.set(this, void 0);
        _Engine_contextManagers.set(this, new Map());
        _Engine_mutationManager.set(this, void 0);
        _Engine_nearConfig.set(this, void 0);
        _Engine_redirectMap.set(this, null);
        _Engine_devModePollingTimer.set(this, null);
        _Engine_repository.set(this, void 0);
        _Engine_viewport.set(this, null
        // ToDo: duplcated in ContextManager and LayoutManager
        );
        // ToDo: duplcated in ContextManager and LayoutManager
        _Engine_refComponents.set(this, new Map());
        this.adapters = new Map();
        this.treeBuilder = null;
        this.started = false;
        this.getLastUsedMutation = () => __awaiter(this, void 0, void 0, function* () {
            const allMutations = yield this.getMutations();
            const hostname = window.location.hostname;
            const lastUsedData = yield Promise.all(allMutations.map((m) => __awaiter(this, void 0, void 0, function* () {
                return ({
                    id: m.id,
                    lastUsage: yield __classPrivateFieldGet(this, _Engine_repository, "f").getMutationLastUsage(m.id, hostname),
                });
            })));
            const usedMutationsData = lastUsedData
                .filter((m) => m.lastUsage)
                .map((m) => ({ id: m.id, lastUsage: new Date(m.lastUsage).getTime() }));
            if (usedMutationsData === null || usedMutationsData === void 0 ? void 0 : usedMutationsData.length) {
                if (usedMutationsData.length === 1)
                    return usedMutationsData[0].id;
                let lastMutation = usedMutationsData[0];
                for (let i = 1; i < usedMutationsData.length; i++) {
                    if (usedMutationsData[i].lastUsage > lastMutation.lastUsage) {
                        lastMutation = usedMutationsData[i];
                    }
                }
                return lastMutation.id;
            }
            else {
                // Activate default mutation for new users
                return __classPrivateFieldGet(this, _Engine_nearConfig, "f").defaultMutationId;
            }
        });
        if (!this.config.storage) {
            this.config.storage = new local_storage_1.LocalStorage('mutable-web-engine');
        }
        __classPrivateFieldSet(this, _Engine_bosWidgetFactory, new bos_widget_factory_1.BosWidgetFactory({
            tagName: (_a = this.config.bosElementName) !== null && _a !== void 0 ? _a : 'bos-component',
            bosElementStyleSrc: this.config.bosElementStyleSrc,
        }), "f");
        __classPrivateFieldSet(this, _Engine_selector, this.config.selector, "f");
        const nearConfig = (0, constants_1.getNearConfig)(this.config.networkId);
        const jsonStorage = new json_storage_1.JsonStorage(this.config.storage);
        __classPrivateFieldSet(this, _Engine_nearConfig, nearConfig, "f");
        __classPrivateFieldSet(this, _Engine_repository, new repository_1.Repository(jsonStorage), "f");
        const nearSigner = new near_signer_1.NearSigner(__classPrivateFieldGet(this, _Engine_selector, "f"), jsonStorage, nearConfig);
        __classPrivateFieldSet(this, _Engine_provider, new social_db_provider_1.SocialDbProvider(nearSigner, nearConfig.contractName), "f");
        __classPrivateFieldSet(this, _Engine_mutationManager, new mutation_manager_1.MutationManager(__classPrivateFieldGet(this, _Engine_provider, "f")), "f");
        exports.engineSingleton = this;
    }
    handleContextStarted(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // if (!this.started) return;
            if (!context.id)
                return;
            // We don't wait adapters here
            const parserConfigs = __classPrivateFieldGet(this, _Engine_mutationManager, "f").filterSuitableParsers(context);
            for (const config of parserConfigs) {
                const adapter = this.createAdapter(config);
                this.registerAdapter(adapter);
            }
            const adapter = this.adapters.get(context.namespace);
            if (!adapter)
                return;
            const contextManager = new context_manager_1.ContextManager(context, adapter, __classPrivateFieldGet(this, _Engine_bosWidgetFactory, "f"), __classPrivateFieldGet(this, _Engine_mutationManager, "f"), __classPrivateFieldGet(this, _Engine_nearConfig, "f").defaultLayoutManager);
            __classPrivateFieldGet(this, _Engine_contextManagers, "f").set(context, contextManager);
            yield this._addAppsAndLinks(context);
            contextManager.setRedirectMap(__classPrivateFieldGet(this, _Engine_redirectMap, "f"));
            // Add existing React component refereneces from portals
            __classPrivateFieldGet(this, _Engine_refComponents, "f").forEach((target, cmp) => {
                if (mutation_manager_1.MutationManager._isTargetMet(target, context)) {
                    contextManager.injectComponent(target, cmp);
                }
            });
        });
    }
    handleContextChanged(context, oldParsedContext) {
        var _a;
        if (!this.started)
            return;
        (_a = __classPrivateFieldGet(this, _Engine_contextManagers, "f").get(context)) === null || _a === void 0 ? void 0 : _a.forceUpdate();
    }
    handleContextFinished(context) {
        var _a;
        if (!this.started)
            return;
        (_a = __classPrivateFieldGet(this, _Engine_contextManagers, "f").get(context)) === null || _a === void 0 ? void 0 : _a.destroy();
        __classPrivateFieldGet(this, _Engine_contextManagers, "f").delete(context);
    }
    handleInsPointStarted(context, newInsPoint) {
        var _a;
        (_a = __classPrivateFieldGet(this, _Engine_contextManagers, "f").get(context)) === null || _a === void 0 ? void 0 : _a.injectLayoutManager(newInsPoint);
    }
    handleInsPointFinished(context, oldInsPoint) {
        var _a;
        (_a = __classPrivateFieldGet(this, _Engine_contextManagers, "f").get(context)) === null || _a === void 0 ? void 0 : _a.destroyLayoutManager(oldInsPoint);
    }
    start(mutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (mutationId === undefined) {
                mutationId = (yield this.getFavoriteMutation()) || (yield this.getLastUsedMutation());
            }
            if (mutationId !== null) {
                const mutations = yield this.getMutations();
                const mutation = (_a = mutations.find((mutation) => mutation.id === mutationId)) !== null && _a !== void 0 ? _a : null;
                if (mutation) {
                    // load mutation
                    yield __classPrivateFieldGet(this, _Engine_mutationManager, "f").switchMutation(mutation);
                    // load non-disabled apps only
                    yield Promise.all(mutation.apps.map((appId) => __awaiter(this, void 0, void 0, function* () {
                        const isAppEnabled = yield __classPrivateFieldGet(this, _Engine_repository, "f").getAppEnabledStatus(mutation.id, appId);
                        if (!isAppEnabled)
                            return;
                        return __classPrivateFieldGet(this, _Engine_mutationManager, "f").loadApp(appId);
                    })));
                    // save last usage
                    const currentDate = new Date().toISOString();
                    yield __classPrivateFieldGet(this, _Engine_repository, "f").setMutationLastUsage(mutation.id, currentDate, window.location.hostname);
                }
                else {
                    console.error('No suitable mutations found');
                }
            }
            this.treeBuilder = new pure_tree_builder_1.PureTreeBuilder(this);
            this.started = true;
            this._attachViewport();
            this._updateRootContext();
            console.log('Mutable Web Engine started!', {
                engine: this,
                provider: __classPrivateFieldGet(this, _Engine_provider, "f"),
            });
        });
    }
    stop() {
        this.started = false;
        this.adapters.forEach((adapter) => this.unregisterAdapter(adapter));
        __classPrivateFieldGet(this, _Engine_contextManagers, "f").forEach((cm) => cm.destroy());
        this.adapters.clear();
        __classPrivateFieldGet(this, _Engine_contextManagers, "f").clear();
        this.treeBuilder = null;
        this._detachViewport();
    }
    getMutations() {
        return __awaiter(this, void 0, void 0, function* () {
            // ToDo: use real context from the PureTreeBuilder
            const context = new pure_context_node_1.PureContextNode('engine', 'website');
            context.parsedContext = { id: window.location.hostname };
            const mutations = yield __classPrivateFieldGet(this, _Engine_mutationManager, "f").getMutationsForContext(context);
            return Promise.all(mutations.map((mut) => this._populateMutationWithSettings(mut)));
        });
    }
    switchMutation(mutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentMutation = yield this.getCurrentMutation();
            if ((currentMutation === null || currentMutation === void 0 ? void 0 : currentMutation.id) === mutationId)
                return;
            this.stop();
            yield this.start(mutationId);
        });
    }
    getCurrentMutation() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const mutation = (_a = __classPrivateFieldGet(this, _Engine_mutationManager, "f")) === null || _a === void 0 ? void 0 : _a.mutation;
            if (!mutation)
                return null;
            return this._populateMutationWithSettings(mutation);
        });
    }
    enableDevMode(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options === null || options === void 0 ? void 0 : options.polling) {
                __classPrivateFieldSet(this, _Engine_devModePollingTimer, setInterval(() => this._tryFetchAndUpdateRedirects(true), 1500), "f");
            }
            else {
                __classPrivateFieldSet(this, _Engine_devModePollingTimer, null, "f");
                yield this._tryFetchAndUpdateRedirects(false);
            }
        });
    }
    disableDevMode() {
        if (__classPrivateFieldGet(this, _Engine_devModePollingTimer, "f") !== null) {
            clearInterval(__classPrivateFieldGet(this, _Engine_devModePollingTimer, "f"));
        }
        __classPrivateFieldSet(this, _Engine_redirectMap, null, "f");
        __classPrivateFieldGet(this, _Engine_contextManagers, "f").forEach((cm) => cm.setRedirectMap(null));
    }
    registerAdapter(adapter) {
        if (!this.treeBuilder)
            throw new Error('Tree builder is not inited');
        this.treeBuilder.appendChild(this.treeBuilder.root, adapter.context);
        this.adapters.set(adapter.namespace, adapter);
        adapter.start();
        console.log(`[MutableWeb] Loaded new adapter: ${adapter.namespace}`);
    }
    unregisterAdapter(adapter) {
        if (!this.treeBuilder)
            throw new Error('Tree builder is not inited');
        adapter.stop();
        this.treeBuilder.removeChild(this.treeBuilder.root, adapter.context);
        this.adapters.delete(adapter.namespace);
    }
    createAdapter(config) {
        if (!this.treeBuilder) {
            throw new Error('Tree builder is not inited');
        }
        switch (config.parserType) {
            case provider_1.AdapterType.Json:
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(document.documentElement, this.treeBuilder, config.id, new json_parser_1.JsonParser(config) // ToDo: add try catch because config can be invalid
                );
            case provider_1.AdapterType.Bos:
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(document.documentElement, this.treeBuilder, config.id, new bos_parser_1.BosParser(config));
            case provider_1.AdapterType.MWeb:
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(document.body, this.treeBuilder, config.id, new mweb_parser_1.MutableWebParser());
            default:
                throw new Error('Incompatible adapter type');
        }
    }
    setFavoriteMutation(mutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return __classPrivateFieldGet(this, _Engine_repository, "f").setFavoriteMutation(mutationId);
        });
    }
    getFavoriteMutation() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield __classPrivateFieldGet(this, _Engine_repository, "f").getFavoriteMutation();
            return value !== null && value !== void 0 ? value : null;
        });
    }
    removeMutationFromRecents(mutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield __classPrivateFieldGet(this, _Engine_repository, "f").setMutationLastUsage(mutationId, null, window.location.hostname);
        });
    }
    getApplications() {
        return __awaiter(this, void 0, void 0, function* () {
            return __classPrivateFieldGet(this, _Engine_provider, "f").getApplications();
        });
    }
    createMutation(mutation) {
        return __awaiter(this, void 0, void 0, function* () {
            // ToDo: move to provider?
            if (yield __classPrivateFieldGet(this, _Engine_provider, "f").getMutation(mutation.id)) {
                throw new Error('Mutation with that ID already exists');
            }
            yield __classPrivateFieldGet(this, _Engine_provider, "f").saveMutation(mutation);
            return this._populateMutationWithSettings(mutation);
        });
    }
    editMutation(mutation) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield __classPrivateFieldGet(this, _Engine_provider, "f").saveMutation(mutation);
            // If the current mutation is edited, reload it
            if (mutation.id === ((_b = (_a = __classPrivateFieldGet(this, _Engine_mutationManager, "f")) === null || _a === void 0 ? void 0 : _a.mutation) === null || _b === void 0 ? void 0 : _b.id)) {
                this.stop();
                yield this.start(mutation.id);
            }
            return this._populateMutationWithSettings(mutation);
        });
    }
    injectComponent(target, cmp) {
        // save refs for future contexts
        __classPrivateFieldGet(this, _Engine_refComponents, "f").set(cmp, target);
        __classPrivateFieldGet(this, _Engine_contextManagers, "f").forEach((contextManager, context) => {
            if (mutation_manager_1.MutationManager._isTargetMet(target, context)) {
                contextManager.injectComponent(target, cmp);
            }
        });
    }
    unjectComponent(target, cmp) {
        __classPrivateFieldGet(this, _Engine_refComponents, "f").delete(cmp);
        __classPrivateFieldGet(this, _Engine_contextManagers, "f").forEach((contextManager, context) => {
            if (mutation_manager_1.MutationManager._isTargetMet(target, context)) {
                contextManager.unjectComponent(target, cmp);
            }
        });
    }
    getAppsFromMutation(mutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { mutation: currentMutation } = __classPrivateFieldGet(this, _Engine_mutationManager, "f");
            // don't fetch mutation if fetched already
            const mutation = (currentMutation === null || currentMutation === void 0 ? void 0 : currentMutation.id) === mutationId
                ? currentMutation
                : yield __classPrivateFieldGet(this, _Engine_provider, "f").getMutation(mutationId);
            if (!mutation) {
                throw new Error(`Mutation doesn't exist: ${mutationId}`);
            }
            // ToDo: improve readability
            return Promise.all(mutation.apps.map((appId) => __classPrivateFieldGet(this, _Engine_provider, "f")
                .getApplication(appId)
                .then((appMetadata) => (appMetadata ? this._populateAppWithSettings(appMetadata) : null)))).then((apps) => apps.filter((app) => app !== null));
        });
    }
    enableApp(appId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const currentMutationId = (_a = __classPrivateFieldGet(this, _Engine_mutationManager, "f").mutation) === null || _a === void 0 ? void 0 : _a.id;
            if (!currentMutationId) {
                throw new Error('Mutation is not active');
            }
            yield __classPrivateFieldGet(this, _Engine_repository, "f").setAppEnabledStatus(currentMutationId, appId, true);
            yield this._startApp(appId);
        });
    }
    disableApp(appId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const currentMutationId = (_a = __classPrivateFieldGet(this, _Engine_mutationManager, "f").mutation) === null || _a === void 0 ? void 0 : _a.id;
            if (!currentMutationId) {
                throw new Error('Mutation is not active');
            }
            yield __classPrivateFieldGet(this, _Engine_repository, "f").setAppEnabledStatus(currentMutationId, appId, false);
            yield this._stopApp(appId);
        });
    }
    _tryFetchAndUpdateRedirects(polling) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const res = yield fetch(constants_1.bosLoaderUrl, {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) {
                    throw new Error('Network response was not OK');
                }
                const data = yield res.json();
                // This function is async
                if (polling && __classPrivateFieldGet(this, _Engine_devModePollingTimer, "f") === null) {
                    return;
                }
                __classPrivateFieldSet(this, _Engine_redirectMap, (_a = data === null || data === void 0 ? void 0 : data.components) !== null && _a !== void 0 ? _a : null, "f");
                __classPrivateFieldGet(this, _Engine_contextManagers, "f").forEach((cm) => cm.setRedirectMap(__classPrivateFieldGet(this, _Engine_redirectMap, "f")));
            }
            catch (err) {
                console.error(err);
                // this.disableDevMode()
            }
        });
    }
    _updateRootContext() {
        var _a, _b;
        if (!this.treeBuilder)
            throw new Error('Tree builder is not inited');
        // ToDo: instantiate root context with data initially
        // ToDo: looks like circular dependency
        this.treeBuilder.updateParsedContext(this.treeBuilder.root, {
            id: window.location.hostname,
            url: window.location.href,
            mutationId: (_b = (_a = __classPrivateFieldGet(this, _Engine_mutationManager, "f").mutation) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
            gatewayId: this.config.gatewayId,
        });
    }
    _populateMutationWithSettings(mutation) {
        return __awaiter(this, void 0, void 0, function* () {
            const isFavorite = (yield this.getFavoriteMutation()) === mutation.id;
            const lastUsage = yield __classPrivateFieldGet(this, _Engine_repository, "f").getMutationLastUsage(mutation.id, window.location.hostname);
            return Object.assign(Object.assign({}, mutation), { settings: {
                    isFavorite,
                    lastUsage,
                } });
        });
    }
    _populateAppWithSettings(app) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const currentMutationId = (_a = __classPrivateFieldGet(this, _Engine_mutationManager, "f").mutation) === null || _a === void 0 ? void 0 : _a.id;
            if (!currentMutationId)
                throw new Error('Mutation is not active');
            return Object.assign(Object.assign({}, app), { settings: {
                    isEnabled: yield __classPrivateFieldGet(this, _Engine_repository, "f").getAppEnabledStatus(currentMutationId, app.id),
                } });
        });
    }
    _attachViewport() {
        if (__classPrivateFieldGet(this, _Engine_viewport, "f"))
            throw new Error('Already attached');
        const viewport = document.createElement('div');
        viewport.id = constants_1.ViewportElementId;
        viewport.setAttribute('data-mweb-shadow-host', '');
        const shadowRoot = viewport.attachShadow({ mode: 'open' });
        // It will prevent inheritance without affecting other CSS defined within the ShadowDOM.
        // https://stackoverflow.com/a/68062098
        const disableCssInheritanceStyle = document.createElement('style');
        disableCssInheritanceStyle.innerHTML = ':host { all: initial; }';
        shadowRoot.appendChild(disableCssInheritanceStyle);
        if (this.config.bosElementStyleSrc) {
            const externalStyleLink = document.createElement('link');
            externalStyleLink.rel = 'stylesheet';
            externalStyleLink.href = this.config.bosElementStyleSrc;
            shadowRoot.appendChild(externalStyleLink);
        }
        const viewportInner = document.createElement('div');
        viewportInner.id = constants_1.ViewportInnerElementId;
        viewportInner.setAttribute('data-bs-theme', 'light'); // ToDo: parametrize
        // Context cannot be a shadow root node because mutation observer doesn't work there
        // So we need to select a child node for context
        viewportInner.setAttribute('data-mweb-context-type', 'shadow-dom');
        shadowRoot.appendChild(viewportInner);
        // Prevent event propagation from BOS-component to parent
        const EventsToStopPropagation = ['click', 'keydown', 'keyup', 'keypress'];
        EventsToStopPropagation.forEach((eventName) => {
            viewport.addEventListener(eventName, (e) => e.stopPropagation());
        });
        document.body.appendChild(viewport);
        __classPrivateFieldSet(this, _Engine_viewport, viewport, "f");
    }
    _detachViewport() {
        if (__classPrivateFieldGet(this, _Engine_viewport, "f")) {
            document.body.removeChild(__classPrivateFieldGet(this, _Engine_viewport, "f"));
            __classPrivateFieldSet(this, _Engine_viewport, null, "f");
        }
    }
    _startApp(appId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.treeBuilder)
                throw new Error('Engine is not started');
            yield __classPrivateFieldGet(this, _Engine_mutationManager, "f").loadApp(appId);
            yield this._traverseContextTree((context) => this._addAppsAndLinks(context, [appId]), this.treeBuilder.root);
        });
    }
    _stopApp(appId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.treeBuilder)
                throw new Error('Engine is not started');
            yield this._traverseContextTree((context) => this._removeAppsAndLinks(context, [appId]), this.treeBuilder.root);
            yield __classPrivateFieldGet(this, _Engine_mutationManager, "f").unloadApp(appId);
        });
    }
    _addAppsAndLinks(context, includedApps) {
        return __awaiter(this, void 0, void 0, function* () {
            const contextManager = __classPrivateFieldGet(this, _Engine_contextManagers, "f").get(context);
            if (!contextManager)
                return;
            const links = yield __classPrivateFieldGet(this, _Engine_mutationManager, "f").getLinksForContext(context, includedApps);
            const apps = __classPrivateFieldGet(this, _Engine_mutationManager, "f").filterSuitableApps(context, includedApps);
            links.forEach((link) => contextManager.addUserLink(link));
            apps.forEach((app) => contextManager.addAppMetadata(app));
        });
    }
    _removeAppsAndLinks(context, includedApps) {
        return __awaiter(this, void 0, void 0, function* () {
            const contextManager = __classPrivateFieldGet(this, _Engine_contextManagers, "f").get(context);
            if (!contextManager)
                return;
            const links = yield __classPrivateFieldGet(this, _Engine_mutationManager, "f").getLinksForContext(context, includedApps);
            links.forEach((link) => contextManager.removeUserLink(link));
            includedApps.forEach((appId) => contextManager.removeAppMetadata(appId));
        });
    }
    _traverseContextTree(callback, parent) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                callback(parent),
                ...parent.children.map((child) => this._traverseContextTree(callback, child)),
            ]);
        });
    }
}
exports.Engine = Engine;
_Engine_provider = new WeakMap(), _Engine_bosWidgetFactory = new WeakMap(), _Engine_selector = new WeakMap(), _Engine_contextManagers = new WeakMap(), _Engine_mutationManager = new WeakMap(), _Engine_nearConfig = new WeakMap(), _Engine_redirectMap = new WeakMap(), _Engine_devModePollingTimer = new WeakMap(), _Engine_repository = new WeakMap(), _Engine_viewport = new WeakMap(), _Engine_refComponents = new WeakMap();
