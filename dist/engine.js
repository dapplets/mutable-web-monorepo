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
var _Engine_linkProvider, _Engine_parserConfigProvider, _Engine_bosWidgetFactory, _Engine_selector, _Engine_contextActionGroups, _Engine_elementsByContext;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = exports.AdapterType = void 0;
const bos_parser_1 = require("./core/parsers/bos-parser");
const json_parser_1 = require("./core/parsers/json-parser");
const microdata_parser_1 = require("./core/parsers/microdata-parser");
const dynamic_html_adapter_1 = require("./core/adapters/dynamic-html-adapter");
const bos_widget_factory_1 = require("./bos/bos-widget-factory");
const social_db_link_provider_1 = require("./providers/social-db-link-provider");
const constants_1 = require("./constants");
const near_signer_1 = require("./providers/near-signer");
const social_db_parser_config_provider_1 = require("./providers/social-db-parser-config-provider");
const pure_tree_builder_1 = require("./core/tree/pure-tree/pure-tree-builder");
var AdapterType;
(function (AdapterType) {
    AdapterType["Bos"] = "bos";
    AdapterType["Microdata"] = "microdata";
    AdapterType["Json"] = "json";
})(AdapterType || (exports.AdapterType = AdapterType = {}));
const activatedParserConfigs = [
    "https://dapplets.org/ns/json/dapplets.near/parser/near-social-viewer",
    "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
];
const ContextActionsGroupSrc = "dapplets.near/widget/ContextActionsGroup";
class Engine {
    constructor(config) {
        this.config = config;
        _Engine_linkProvider.set(this, void 0);
        _Engine_parserConfigProvider.set(this, void 0);
        _Engine_bosWidgetFactory.set(this, void 0);
        _Engine_selector.set(this, void 0);
        _Engine_contextActionGroups.set(this, new WeakMap());
        _Engine_elementsByContext.set(this, new WeakMap());
        this.adapters = new Set();
        this.treeBuilder = new pure_tree_builder_1.PureTreeBuilder(this); //new DomTreeBuilder(this);
        this.started = false;
        __classPrivateFieldSet(this, _Engine_bosWidgetFactory, new bos_widget_factory_1.BosWidgetFactory({
            tagName: "bos-component",
        }), "f");
        const nearConfig = (0, constants_1.getNearConfig)(this.config.networkId);
        __classPrivateFieldSet(this, _Engine_selector, this.config.selector, "f");
        const nearSigner = new near_signer_1.NearSigner(__classPrivateFieldGet(this, _Engine_selector, "f"), nearConfig.nodeUrl);
        __classPrivateFieldSet(this, _Engine_linkProvider, new social_db_link_provider_1.SocialDbLinkProvider(nearSigner, nearConfig.contractName), "f");
        __classPrivateFieldSet(this, _Engine_parserConfigProvider, new social_db_parser_config_provider_1.SocialDbParserConfigProvider(nearSigner, nearConfig.contractName), "f");
        console.log(__classPrivateFieldGet(this, _Engine_parserConfigProvider, "f"));
        console.log(__classPrivateFieldGet(this, _Engine_linkProvider, "f"));
    }
    handleContextStarted(context) {
        if (!this.started)
            return;
        __classPrivateFieldGet(this, _Engine_linkProvider, "f").getLinksForContext(context)
            .then((links) => {
            for (const link of links) {
                this._processUserLink(context, link);
            }
        })
            .catch((err) => console.error(err));
    }
    handleContextChanged(context, oldParsedContext) {
        var _a;
        if (!this.started)
            return;
        (_a = __classPrivateFieldGet(this, _Engine_elementsByContext, "f").get(context)) === null || _a === void 0 ? void 0 : _a.forEach((element) => {
            element.props = Object.assign(Object.assign(Object.assign({}, element.props), { 
                // ToDo: unify context forwarding
                context: context.parsedContext }), context.parsedContext);
        });
    }
    handleContextFinished(context) {
        var _a;
        if (!this.started)
            return;
        (_a = __classPrivateFieldGet(this, _Engine_elementsByContext, "f").get(context)) === null || _a === void 0 ? void 0 : _a.forEach((element) => {
            element.remove();
        });
    }
    _processUserLink(context, link) {
        // ToDo: do not concatenate namespaces
        const adapter = Array.from(this.adapters.values()).find((adapter) => adapter.namespace === link.namespace);
        if (!adapter)
            return;
        const element = __classPrivateFieldGet(this, _Engine_bosWidgetFactory, "f").createWidget(link.component);
        // ToDo: extract to separate method and currify
        const createUserLink = (linkFromBos) => __awaiter(this, void 0, void 0, function* () {
            const { namespace, contextType, contextId, insertionPoint, insertionType, component, } = linkFromBos;
            const newLink = {
                namespace: namespace !== undefined ? namespace : link.namespace,
                contextType: contextType !== undefined ? contextType : link.contextType,
                contextId: contextId !== undefined ? contextId : context.id,
                insertionPoint: insertionPoint,
                insertionType: insertionType,
                component: component,
            };
            yield __classPrivateFieldGet(this, _Engine_linkProvider, "f").createLink(newLink);
            this._processUserLink(context, newLink);
        });
        element.props = Object.assign({ 
            // ToDo: rerender component on context change
            createUserLink, 
            // ToDo: unify context forwarding
            context: context.parsedContext }, context.parsedContext);
        // ToDo: generalize layout managers for insertion points at the core level
        // Generic insertion point for all contexts
        if (link.insertionPoint === "root" && link.insertionType === "inside") {
            if (!__classPrivateFieldGet(this, _Engine_contextActionGroups, "f").has(context)) {
                const groupElement = __classPrivateFieldGet(this, _Engine_bosWidgetFactory, "f").createWidget(ContextActionsGroupSrc);
                __classPrivateFieldGet(this, _Engine_contextActionGroups, "f").set(context, groupElement);
                adapter.injectElement(groupElement, context, link.insertionPoint, link.insertionType);
            }
            const groupElement = __classPrivateFieldGet(this, _Engine_contextActionGroups, "f").get(context);
            groupElement.appendChild(element);
        }
        else {
            try {
                adapter.injectElement(element, context, link.insertionPoint, link.insertionType);
            }
            catch (err) {
                console.error(err);
            }
        }
        if (!__classPrivateFieldGet(this, _Engine_elementsByContext, "f").has(context)) {
            __classPrivateFieldGet(this, _Engine_elementsByContext, "f").set(context, new Set());
        }
        __classPrivateFieldGet(this, _Engine_elementsByContext, "f").get(context).add(element);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.started = true;
            const adaptersToActivate = [];
            // Adapters enabled by default
            adaptersToActivate.push(this.createAdapter(AdapterType.Bos));
            adaptersToActivate.push(this.createAdapter(AdapterType.Microdata));
            for (const configId of activatedParserConfigs) {
                const config = yield __classPrivateFieldGet(this, _Engine_parserConfigProvider, "f").getParserConfig(configId);
                if (config) {
                    const adapter = this.createAdapter(AdapterType.Json, config);
                    adaptersToActivate.push(adapter);
                }
            }
            adaptersToActivate.forEach((adapter) => this.registerAdapter(adapter));
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
    createAdapter(type, config) {
        const observingElement = document.body;
        switch (type) {
            case AdapterType.Bos:
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(observingElement, this.treeBuilder, "https://dapplets.org/ns/bos", new bos_parser_1.BosParser());
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
_Engine_linkProvider = new WeakMap(), _Engine_parserConfigProvider = new WeakMap(), _Engine_bosWidgetFactory = new WeakMap(), _Engine_selector = new WeakMap(), _Engine_contextActionGroups = new WeakMap(), _Engine_elementsByContext = new WeakMap();
