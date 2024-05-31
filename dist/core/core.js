"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Core = void 0;
const pure_tree_builder_1 = require("./tree/pure-tree/pure-tree-builder");
const dynamic_html_adapter_1 = require("./adapters/dynamic-html-adapter");
const provider_1 = require("../engine/providers/provider");
const json_parser_1 = require("./parsers/json-parser");
const bos_parser_1 = require("./parsers/bos-parser");
const mweb_parser_1 = require("./parsers/mweb-parser");
const event_emitter_1 = require("./event-emitter");
class Core {
    get tree() {
        return this._treeBuilder.root;
    }
    constructor(config) {
        /**
         * @deprecated
         */
        this.adapters = new Map();
        this._eventEmitter = new event_emitter_1.EventEmitter();
        this._treeBuilder = new pure_tree_builder_1.PureTreeBuilder(this._eventEmitter);
    }
    attachParserConfig(parserConfig) {
        const adapter = this._createAdapter(parserConfig);
        this._registerAdapter(adapter);
    }
    detachParserConfig(namespace) {
        const adapter = this.adapters.get(namespace);
        if (!adapter)
            throw new Error('Adapter is not registried');
        this._unregisterAdapter(adapter);
    }
    on(eventName, callback) {
        return this._eventEmitter.on(eventName, callback);
    }
    off(eventName, callback) {
        return this._eventEmitter.off(eventName, callback);
    }
    updateRootContext(rootParsedContext = {}) {
        this._treeBuilder.updateParsedContext(this._treeBuilder.root, Object.assign({ id: window.location.hostname, url: window.location.href }, rootParsedContext));
    }
    clear() {
        this.adapters.forEach((adapter) => this._unregisterAdapter(adapter));
        this.adapters.clear();
        this._treeBuilder.clear();
    }
    _registerAdapter(adapter) {
        if (!this._treeBuilder)
            throw new Error('Tree builder is not inited');
        this._treeBuilder.appendChild(this._treeBuilder.root, adapter.context);
        this.adapters.set(adapter.namespace, adapter);
        adapter.start();
        console.log(`[MutableWeb] Loaded new adapter: ${adapter.namespace}`);
    }
    _unregisterAdapter(adapter) {
        if (!this._treeBuilder)
            throw new Error('Tree builder is not inited');
        adapter.stop();
        this._treeBuilder.removeChild(this._treeBuilder.root, adapter.context);
        this.adapters.delete(adapter.namespace);
    }
    _createAdapter(config) {
        if (!this._treeBuilder) {
            throw new Error('Tree builder is not inited');
        }
        switch (config.parserType) {
            case provider_1.AdapterType.Json:
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(document.documentElement, this._treeBuilder, config.id, new json_parser_1.JsonParser(config) // ToDo: add try catch because config can be invalid
                );
            case provider_1.AdapterType.Bos:
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(document.documentElement, this._treeBuilder, config.id, new bos_parser_1.BosParser(config));
            case provider_1.AdapterType.MWeb:
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(document.body, this._treeBuilder, config.id, new mweb_parser_1.MutableWebParser());
            default:
                throw new Error('Incompatible adapter type');
        }
    }
}
exports.Core = Core;
