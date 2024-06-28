"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Core = void 0;
const pure_tree_builder_1 = require("./tree/pure-tree/pure-tree-builder");
const dynamic_html_adapter_1 = require("./adapters/dynamic-html-adapter");
const json_parser_1 = require("./parsers/json-parser");
const bos_parser_1 = require("./parsers/bos-parser");
const mweb_parser_1 = require("./parsers/mweb-parser");
const types_1 = require("./types");
class Core {
    get tree() {
        return this._treeBuilder.root;
    }
    constructor() {
        this.adapters = new Map();
        this._treeBuilder = new pure_tree_builder_1.PureTreeBuilder();
    }
    attachParserConfig(parserConfig) {
        const adapter = this._createAdapter(parserConfig);
        this._registerAdapter(adapter);
    }
    detachParserConfig(namespace) {
        const adapter = this.adapters.get(namespace);
        if (!adapter)
            return;
        this._unregisterAdapter(adapter);
    }
    /**
     * @deprecated
     */
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
        console.log(`[MutableWeb] Loaded parser: ${adapter.namespace}`);
    }
    _unregisterAdapter(adapter) {
        if (!this._treeBuilder)
            throw new Error('Tree builder is not inited');
        adapter.stop();
        this._treeBuilder.removeChild(this._treeBuilder.root, adapter.context);
        this.adapters.delete(adapter.namespace);
        console.log(`[MutableWeb] Unloaded parser: ${adapter.namespace}`);
    }
    _createAdapter(config) {
        if (!this._treeBuilder) {
            throw new Error('Tree builder is not inited');
        }
        switch (config.parserType) {
            case types_1.AdapterType.Json:
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(document.documentElement, this._treeBuilder, config.id, new json_parser_1.JsonParser(config) // ToDo: add try catch because config can be invalid
                );
            case types_1.AdapterType.Bos:
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(document.documentElement, this._treeBuilder, config.id, new bos_parser_1.BosParser(config));
            case types_1.AdapterType.MWeb:
                return new dynamic_html_adapter_1.DynamicHtmlAdapter(document.body, this._treeBuilder, config.id, new mweb_parser_1.MutableWebParser());
            default:
                throw new Error('Incompatible adapter type');
        }
    }
}
exports.Core = Core;
