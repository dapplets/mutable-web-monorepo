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
var _Engine_provider, _Engine_bosWidgetFactory, _Engine_selector, _Engine_contextManagers, _Engine_mutationManager, _Engine_nearConfig, _Engine_redirectMap, _Engine_devModePollingTimer, _Engine_repository;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = exports.AdapterType = void 0;
const dynamic_html_adapter_1 = require("./core/adapters/dynamic-html-adapter");
const bos_widget_factory_1 = require("./bos/bos-widget-factory");
const constants_1 = require("./constants");
const near_signer_1 = require("./providers/near-signer");
const social_db_provider_1 = require("./providers/social-db-provider");
const pure_tree_builder_1 = require("./core/tree/pure-tree/pure-tree-builder");
const context_manager_1 = require("./context-manager");
const mutation_manager_1 = require("./mutation-manager");
const json_parser_1 = require("./core/parsers/json-parser");
const bos_parser_1 = require("./core/parsers/bos-parser");
const pure_context_node_1 = require("./core/tree/pure-tree/pure-context-node");
const repository_1 = require("./storage/repository");
const json_storage_1 = require("./storage/json-storage");
const local_storage_1 = require("./storage/local-storage");
var AdapterType;
(function (AdapterType) {
    AdapterType["Bos"] = "bos";
    AdapterType["Microdata"] = "microdata";
    AdapterType["Json"] = "json";
})(AdapterType || (exports.AdapterType = AdapterType = {}));
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
        this.adapters = new Set();
        this.treeBuilder = null;
        this.started = false;
        if (!this.config.storage) {
            this.config.storage = new local_storage_1.LocalStorage('mutable-web-engine');
        }
        __classPrivateFieldSet(this, _Engine_bosWidgetFactory, new bos_widget_factory_1.BosWidgetFactory({
            networkId: this.config.networkId,
            selector: this.config.selector,
            tagName: (_a = this.config.bosElementName) !== null && _a !== void 0 ? _a : 'bos-component',
        }), "f");
        __classPrivateFieldSet(this, _Engine_selector, this.config.selector, "f");
        const nearConfig = (0, constants_1.getNearConfig)(this.config.networkId);
        const jsonStorage = new json_storage_1.JsonStorage(this.config.storage);
        __classPrivateFieldSet(this, _Engine_nearConfig, nearConfig, "f");
        __classPrivateFieldSet(this, _Engine_repository, new repository_1.Repository(jsonStorage), "f");
        const nearSigner = new near_signer_1.NearSigner(__classPrivateFieldGet(this, _Engine_selector, "f"), jsonStorage, nearConfig);
        __classPrivateFieldSet(this, _Engine_provider, new social_db_provider_1.SocialDbProvider(nearSigner, nearConfig.contractName), "f");
        __classPrivateFieldSet(this, _Engine_mutationManager, new mutation_manager_1.MutationManager(__classPrivateFieldGet(this, _Engine_provider, "f")), "f");
    }
    handleContextStarted(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // if (!this.started) return;
            if (!context.id)
                return;
            // We don't wait adapters here
            // Find and load adapters for the given context
            const parserConfigs = __classPrivateFieldGet(this, _Engine_mutationManager, "f").filterSuitableParsers(context);
            for (const config of parserConfigs) {
                const adapter = this.createAdapter(config);
                this.registerAdapter(adapter);
                console.log(`[MutableWeb] Loaded new adapter: ${adapter.namespace}`);
            }
            // ToDo: do not iterate over all adapters
            const adapter = Array.from(this.adapters).find((adapter) => {
                return adapter.getInsertionPoints(context).length > 0;
            });
            if (!adapter)
                return;
            const contextManager = new context_manager_1.ContextManager(context, adapter, __classPrivateFieldGet(this, _Engine_bosWidgetFactory, "f"), __classPrivateFieldGet(this, _Engine_mutationManager, "f"), __classPrivateFieldGet(this, _Engine_nearConfig, "f").defaultLayoutManager);
            __classPrivateFieldGet(this, _Engine_contextManagers, "f").set(context, contextManager);
            const links = yield __classPrivateFieldGet(this, _Engine_mutationManager, "f").getLinksForContext(context);
            const apps = __classPrivateFieldGet(this, _Engine_mutationManager, "f").filterSuitableApps(context);
            links.forEach((link) => contextManager.addUserLink(link));
            apps.forEach((app) => contextManager.addAppMetadata(app));
            contextManager.setRedirectMap(__classPrivateFieldGet(this, _Engine_redirectMap, "f"));
        });
    }
    handleContextChanged(context, oldParsedContext) {
        var _a;
        if (!this.started)
            return;
        (_a = __classPrivateFieldGet(this, _Engine_contextManagers, "f").get(context)) === null || _a === void 0 ? void 0 : _a.forceUpdate();
    }
    handleContextFinished(context) {
        if (!this.started)
            return;
        // ToDo: will layout managers be removed from the DOM?
        __classPrivateFieldGet(this, _Engine_contextManagers, "f").delete(context);
    }
    handleInsPointStarted(context, newInsPoint) {
        var _a;
        (_a = __classPrivateFieldGet(this, _Engine_contextManagers, "f").get(context)) === null || _a === void 0 ? void 0 : _a.injectLayoutManager(newInsPoint);
    }
    handleInsPointFinished(context, oldInsPoint) {
        // ToDo: do nothing because IP unmounted?
    }
    start(mutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (mutationId === undefined) {
                mutationId = yield this.getFavoriteMutation();
            }
            if (mutationId !== null) {
                const mutations = yield this.getMutations();
                const mutation = (_a = mutations.find((mutation) => mutation.id === mutationId)) !== null && _a !== void 0 ? _a : null;
                if (mutation) {
                    // load mutation and apps
                    yield __classPrivateFieldGet(this, _Engine_mutationManager, "f").switchMutation(mutation);
                    // save last usage
                    const currentDate = new Date().toISOString();
                    yield __classPrivateFieldGet(this, _Engine_repository, "f").setMutationLastUsage(mutation.id, currentDate);
                }
                else {
                    console.error('No suitable mutations found');
                }
            }
            this.treeBuilder = new pure_tree_builder_1.PureTreeBuilder(this);
            this.started = true;
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
    }
    getMutations() {
        return __awaiter(this, void 0, void 0, function* () {
            // ToDo: use real context from the PureTreeBuilder
            const context = new pure_context_node_1.PureContextNode('engine', 'website');
            context.parsedContext = { id: window.location.hostname };
            const mutations = yield __classPrivateFieldGet(this, _Engine_mutationManager, "f").getMutationsForContext(context);
            return Promise.all(mutations.map((mut) => this._populateMutationSettings(mut)));
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
            return this._populateMutationSettings(mutation);
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
        this.adapters.add(adapter);
        adapter.start();
    }
    unregisterAdapter(adapter) {
        if (!this.treeBuilder)
            throw new Error('Tree builder is not inited');
        adapter.stop();
        this.treeBuilder.removeChild(this.treeBuilder.root, adapter.context);
        this.adapters.delete(adapter);
    }
    createAdapter(config) {
        if (!this.treeBuilder) {
            throw new Error('Tree builder is not inited');
        }
        switch (config === null || config === void 0 ? void 0 : config.parserType) {
            case 'json':
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(document.body, this.treeBuilder, config.id, new json_parser_1.JsonParser(config) // ToDo: add try catch because config can be invalid
                );
            case 'bos':
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(document.body, this.treeBuilder, config.id, new bos_parser_1.BosParser(config));
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
            // Activate default mutation for new users
            if (value === undefined) {
                return __classPrivateFieldGet(this, _Engine_nearConfig, "f").defaultMutationId;
            }
            return value;
        });
    }
    removeMutationFromRecents(mutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield __classPrivateFieldGet(this, _Engine_repository, "f").setMutationLastUsage(mutationId, null);
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
            return this._populateMutationSettings(mutation);
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
            return this._populateMutationSettings(mutation);
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
                this.disableDevMode();
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
    _populateMutationSettings(mutation) {
        return __awaiter(this, void 0, void 0, function* () {
            const isFavorite = (yield this.getFavoriteMutation()) === mutation.id;
            const lastUsage = yield __classPrivateFieldGet(this, _Engine_repository, "f").getMutationLastUsage(mutation.id);
            return Object.assign(Object.assign({}, mutation), { settings: {
                    isFavorite,
                    lastUsage,
                } });
        });
    }
}
exports.Engine = Engine;
_Engine_provider = new WeakMap(), _Engine_bosWidgetFactory = new WeakMap(), _Engine_selector = new WeakMap(), _Engine_contextManagers = new WeakMap(), _Engine_mutationManager = new WeakMap(), _Engine_nearConfig = new WeakMap(), _Engine_redirectMap = new WeakMap(), _Engine_devModePollingTimer = new WeakMap(), _Engine_repository = new WeakMap();
