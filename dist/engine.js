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
var _Engine_provider, _Engine_bosWidgetFactory, _Engine_selector, _Engine_contextManagers;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = exports.AdapterType = void 0;
const bos_parser_1 = require("./core/parsers/bos-parser");
const json_parser_1 = require("./core/parsers/json-parser");
const microdata_parser_1 = require("./core/parsers/microdata-parser");
const dynamic_html_adapter_1 = require("./core/adapters/dynamic-html-adapter");
const bos_widget_factory_1 = require("./bos/bos-widget-factory");
const constants_1 = require("./constants");
const near_signer_1 = require("./providers/near-signer");
const social_db_provider_1 = require("./providers/social-db-provider");
const pure_tree_builder_1 = require("./core/tree/pure-tree/pure-tree-builder");
const context_manager_1 = require("./context-manager");
var AdapterType;
(function (AdapterType) {
    AdapterType["Bos"] = "bos";
    AdapterType["Microdata"] = "microdata";
    AdapterType["Json"] = "json";
})(AdapterType || (exports.AdapterType = AdapterType = {}));
class Engine {
    constructor(config) {
        this.config = config;
        _Engine_provider.set(this, void 0);
        _Engine_bosWidgetFactory.set(this, void 0);
        _Engine_selector.set(this, void 0);
        _Engine_contextManagers.set(this, new WeakMap());
        this.adapters = new Set();
        this.started = false;
        __classPrivateFieldSet(this, _Engine_bosWidgetFactory, new bos_widget_factory_1.BosWidgetFactory({
            networkId: this.config.networkId,
            selector: this.config.selector,
            tagName: "bos-component",
        }), "f");
        const nearConfig = (0, constants_1.getNearConfig)(this.config.networkId);
        __classPrivateFieldSet(this, _Engine_selector, this.config.selector, "f");
        const nearSigner = new near_signer_1.NearSigner(__classPrivateFieldGet(this, _Engine_selector, "f"), nearConfig.nodeUrl);
        __classPrivateFieldSet(this, _Engine_provider, new social_db_provider_1.SocialDbProvider(nearSigner, nearConfig.contractName), "f");
        this.treeBuilder = new pure_tree_builder_1.PureTreeBuilder(this);
        // ToDo: instantiate root context with data initially
        // ToDo: looks like circular dependency
        this.treeBuilder.updateParsedContext(this.treeBuilder.root, {
            id: window.location.hostname,
            // ToDo: add mutationId
        });
    }
    handleContextStarted(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // if (!this.started) return;
            if (!context.id)
                return;
            // Find and load adapters for the given context
            // ToDo: parallelize
            __classPrivateFieldGet(this, _Engine_provider, "f").getParserConfigsForContext(context).then((configs) => {
                for (const config of configs) {
                    const type = this.getParserType(config.namespace);
                    if (!type) {
                        console.error("Unsupported parser namespace");
                        continue;
                    }
                    const adapter = this.createAdapter(type, config);
                    this.registerAdapter(adapter);
                    console.log(`[MutableWeb] Loaded new adapter: ${adapter.namespace}`);
                }
            });
            // ToDo: do not iterate over all adapters
            const adapter = Array.from(this.adapters).find((adapter) => {
                return adapter.getInsertionPoints(context).length > 0;
            });
            if (!adapter)
                return;
            const contextManager = new context_manager_1.ContextManager(context, adapter, __classPrivateFieldGet(this, _Engine_bosWidgetFactory, "f"), __classPrivateFieldGet(this, _Engine_provider, "f"));
            __classPrivateFieldGet(this, _Engine_contextManagers, "f").set(context, contextManager);
            const links = yield __classPrivateFieldGet(this, _Engine_provider, "f").getLinksForContext(context);
            links.forEach((link) => contextManager.addUserLink(link));
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
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.started = true;
            console.log("Mutable Web Engine started!", {
                engine: this,
                provider: __classPrivateFieldGet(this, _Engine_provider, "f"),
            });
        });
    }
    stop() {
        this.started = false;
        this.adapters.forEach((adapter) => this.unregisterAdapter(adapter));
    }
    registerAdapter(adapter) {
        this.treeBuilder.appendChild(this.treeBuilder.root, adapter.context);
        this.adapters.add(adapter);
        adapter.start();
    }
    unregisterAdapter(adapter) {
        adapter.stop();
        this.treeBuilder.removeChild(this.treeBuilder.root, adapter.context);
        this.adapters.delete(adapter);
    }
    getParserType(ns) {
        if (ns.startsWith("https://dapplets.org/ns/json")) {
            return AdapterType.Json;
        }
        else if (ns.startsWith("https://dapplets.org/ns/bos")) {
            return AdapterType.Bos;
        }
        else if (ns.startsWith("https://dapplets.org/ns/microdata")) {
            return AdapterType.Microdata;
        }
        else {
            return null;
        }
    }
    createAdapter(type, config) {
        const observingElement = document.body;
        switch (type) {
            case AdapterType.Bos:
                if (!(config === null || config === void 0 ? void 0 : config.namespace)) {
                    throw new Error("Json adapter requires id");
                }
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(observingElement, this.treeBuilder, config.namespace, new bos_parser_1.BosParser(config));
            case AdapterType.Microdata:
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(observingElement, this.treeBuilder, "https://dapplets.org/ns/microdata", new microdata_parser_1.MicrodataParser());
            case AdapterType.Json:
                if (!(config === null || config === void 0 ? void 0 : config.namespace)) {
                    throw new Error("Json adapter requires id");
                }
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(observingElement, this.treeBuilder, config.namespace, new json_parser_1.JsonParser(config) // ToDo: add try catch because config can be invalid
                );
            default:
                throw new Error("Incompatible adapter type");
        }
    }
}
exports.Engine = Engine;
_Engine_provider = new WeakMap(), _Engine_bosWidgetFactory = new WeakMap(), _Engine_selector = new WeakMap(), _Engine_contextManagers = new WeakMap();
