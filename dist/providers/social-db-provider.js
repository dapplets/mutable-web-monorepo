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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _SocialDbProvider_client;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialDbProvider = void 0;
const utils_1 = require("../core/utils");
const social_db_client_1 = require("./social-db-client");
const constants_1 = require("../constants");
const js_sha256_1 = require("js-sha256");
const json_stringify_deterministic_1 = __importDefault(require("json-stringify-deterministic"));
const DappletsNamespace = "https://dapplets.org/ns/";
const SupportedParserTypes = ["json", "bos"];
const ProjectIdKey = "dapplets.near";
const ParserKey = "parser";
const SettingsKey = "settings";
const LinkKey = "link";
const WidgetKey = "widget";
const SelfKey = "";
const LinkTemplateKey = "linkTemplate";
const ParserContextsKey = "contexts";
const WildcardKey = "*";
/**
 * Source: https://gist.github.com/themikefuller/c1de46cbbdad02645b9dc006baedf88e
 */
function base64EncodeURL(byteArray) {
    return btoa(Array.from(new Uint8Array(byteArray))
        .map((val) => {
        return String.fromCharCode(val);
    })
        .join(""))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/\=/g, "");
}
/**
 * Hashes object using deterministic serializator, SHA-256 and base64url encoding
 */
function hashObject(obj) {
    const json = (0, json_stringify_deterministic_1.default)(obj);
    const hashBytes = js_sha256_1.sha256.create().update(json).arrayBuffer();
    return base64EncodeURL(hashBytes);
}
function getValueByKey(keys, obj) {
    const [firstKey, ...anotherKeys] = keys;
    if (anotherKeys.length === 0) {
        return obj[firstKey];
    }
    else {
        return getValueByKey(anotherKeys, obj[firstKey]);
    }
}
/**
 * All Mutable Web data is stored in the Social DB contract in `settings` namespace.
 * More info about the schema is here:
 * https://github.com/NearSocial/standards/blob/8713aed325226db5cf97ab9744ba78b561cc377b/types/settings/Settings.md
 *
 * Example of a data stored in the contract is here:
 * /docs/social-db-reference.json
 */
class SocialDbProvider {
    constructor(_signer, _contractName) {
        this._signer = _signer;
        _SocialDbProvider_client.set(this, void 0);
        __classPrivateFieldSet(this, _SocialDbProvider_client, new social_db_client_1.SocialDbClient(_signer, _contractName), "f");
    }
    // #region Read methods
    getParserConfigsForContext(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // ToDo: implement adapters loading for another types of contexts
            if (context.namespaceURI !== constants_1.DappletsEngineNs)
                return [];
            const contextHashKey = hashObject({
                namespace: context.namespaceURI,
                contextType: context.tagName,
                contextId: context.id,
            });
            const keys = [
                WildcardKey, // from any user
                SettingsKey,
                ProjectIdKey,
                ParserKey,
                WildcardKey, // any parser
                ParserContextsKey,
                contextHashKey,
            ];
            const availableKeys = yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").keys([keys.join("/")]);
            const parserKeys = availableKeys
                .map((key) => key.substring(0, key.lastIndexOf("/"))) // discard contextHashKey
                .map((key) => key.substring(0, key.lastIndexOf("/"))); // discard ParserContextsKey
            const queryResult = yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").get(parserKeys);
            const parsers = [];
            for (const key of parserKeys) {
                const json = getValueByKey(key.split("/"), queryResult);
                parsers.push(JSON.parse(json));
            }
            return parsers;
        });
    }
    getParserConfig(ns) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            const { accountId, parserLocalId } = this._extractParserIdFromNamespace(ns);
            const queryResult = yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").get([
                `*/${SettingsKey}/${ProjectIdKey}/${ParserKey}/${parserLocalId}/**`,
            ]);
            const parserConfigJson = (_e = (_d = (_c = (_b = (_a = queryResult[accountId]) === null || _a === void 0 ? void 0 : _a[SettingsKey]) === null || _b === void 0 ? void 0 : _b[ProjectIdKey]) === null || _c === void 0 ? void 0 : _c[ParserKey]) === null || _d === void 0 ? void 0 : _d[parserLocalId]) === null || _e === void 0 ? void 0 : _e[SelfKey];
            if (!parserConfigJson)
                return null;
            return JSON.parse(parserConfigJson);
        });
    }
    createParserConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { accountId, parserLocalId } = this._extractParserIdFromNamespace(config.namespace);
            const keys = [
                accountId,
                SettingsKey,
                ProjectIdKey,
                ParserKey,
                parserLocalId,
            ];
            const storedParserConfig = {
                [SelfKey]: JSON.stringify(config),
            };
            yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").set(this._buildNestedData(keys, storedParserConfig));
        });
    }
    getLinksForContext(context) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // JSON-configured parsers require id for the context
            if (!context.id &&
                context.namespaceURI.startsWith("https://dapplets.org/ns/json/")) {
                return [];
            }
            // ToDo: index links by context/widget/contextType/etc.
            // ToDo: fix GasLimitExceeded error using Social DB API
            // ToDo: cache the query
            // Fetch all links from every user
            const resp = yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").get([
                `*/${SettingsKey}/${ProjectIdKey}/${LinkKey}/*/${WidgetKey}/*/**`,
            ]);
            const userLinksOutput = [];
            for (const accountId in resp) {
                const widgetOwners = resp[accountId][SettingsKey][ProjectIdKey][LinkKey];
                for (const widgetOwnerId in widgetOwners) {
                    const widgets = widgetOwners[widgetOwnerId][WidgetKey];
                    for (const widgetLocalId in widgets) {
                        const userLinks = widgets[widgetLocalId];
                        for (const linkId in userLinks) {
                            const link = userLinks[linkId];
                            // Include only suitable links
                            if (link.namespace && link.namespace !== context.namespaceURI)
                                continue;
                            if (link.contextType && link.contextType !== context.tagName)
                                continue;
                            if (link.contextId && link.contextId !== context.id)
                                continue;
                            const userLink = {
                                id: linkId,
                                namespace: link.namespace,
                                contextType: link.contextType,
                                contextId: (_a = link.contextId) !== null && _a !== void 0 ? _a : null,
                                insertionPoint: link.insertionPoint,
                                bosWidgetId: `${widgetOwnerId}/${WidgetKey}/${widgetLocalId}`,
                                authorId: accountId,
                            };
                            userLinksOutput.push(userLink);
                        }
                    }
                }
            }
            return userLinksOutput;
        });
    }
    createLink(link) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const linkId = (0, utils_1.generateGuid)();
            const [widgetOwnerId, , bosWidgetLocalId] = link.bosWidgetId.split("/");
            const accountId = yield this._signer.getAccountId();
            if (!accountId)
                throw new Error("User is not logged in");
            const keys = [
                accountId,
                SettingsKey,
                ProjectIdKey,
                LinkKey,
                widgetOwnerId,
                WidgetKey,
                bosWidgetLocalId,
                linkId,
            ];
            const storedUserLink = {
                namespace: link.namespace,
                contextType: link.contextType,
                contextId: (_a = link.contextId) !== null && _a !== void 0 ? _a : null,
                insertionPoint: link.insertionPoint,
            };
            yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").set(this._buildNestedData(keys, storedUserLink));
            return Object.assign(Object.assign({ id: linkId }, link), { authorId: accountId });
        });
    }
    deleteUserLink(userLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const [widgetOwnerId, , bosWidgetLocalId] = userLink.bosWidgetId.split("/");
            const accountId = yield this._signer.getAccountId();
            if (!accountId)
                throw new Error("User is not logged in");
            const keys = [
                accountId,
                SettingsKey,
                ProjectIdKey,
                LinkKey,
                widgetOwnerId,
                WidgetKey,
                bosWidgetLocalId,
                userLink.id,
            ];
            const storedUserLink = {
                [SelfKey]: null,
                namespace: null,
                contextType: null,
                contextId: null,
                insertionPoint: null,
            };
            yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").set(this._buildNestedData(keys, storedUserLink));
        });
    }
    getLinkTemplates(bosWidgetId) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            const [ownerId, , bosWidgetLocalId] = bosWidgetId.split("/");
            const resp = yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").get([
                `${ownerId}/${SettingsKey}/${ProjectIdKey}/${LinkTemplateKey}/${ownerId}/${WidgetKey}/${bosWidgetLocalId}/**`,
            ]);
            const linkTemplates = (_f = (_e = (_d = (_c = (_b = (_a = resp[ownerId]) === null || _a === void 0 ? void 0 : _a[SettingsKey]) === null || _b === void 0 ? void 0 : _b[ProjectIdKey]) === null || _c === void 0 ? void 0 : _c[LinkTemplateKey]) === null || _d === void 0 ? void 0 : _d[ownerId]) === null || _e === void 0 ? void 0 : _e[WidgetKey]) === null || _f === void 0 ? void 0 : _f[bosWidgetLocalId];
            if (!linkTemplates)
                return [];
            const linksOutput = [];
            for (const linkTemplateId in linkTemplates) {
                const link = linkTemplates[linkTemplateId];
                const userLink = {
                    id: linkTemplateId,
                    namespace: link.namespace,
                    contextType: link.contextType,
                    contextId: link.contextId,
                    insertionPoint: link.insertionPoint,
                    bosWidgetId: `${ownerId}/${WidgetKey}/${bosWidgetLocalId}`,
                };
                linksOutput.push(userLink);
            }
            return linksOutput;
        });
    }
    // #endregion
    // #region Write methods
    createLinkTemplate(linkTemplate) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const linkTemplateId = (0, utils_1.generateGuid)();
            const [widgetOwnerId, , bosWidgetLocalId] = linkTemplate.bosWidgetId.split("/");
            const accountId = yield this._signer.getAccountId();
            if (!accountId)
                throw new Error("User is not logged in");
            const keys = [
                accountId,
                SettingsKey,
                ProjectIdKey,
                LinkTemplateKey,
                widgetOwnerId,
                WidgetKey,
                bosWidgetLocalId,
                linkTemplateId,
            ];
            const storedLinkTemplate = {
                namespace: linkTemplate.namespace,
                contextType: linkTemplate.contextType,
                contextId: (_a = linkTemplate.contextId) !== null && _a !== void 0 ? _a : null,
                insertionPoint: linkTemplate.insertionPoint,
            };
            yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").set(this._buildNestedData(keys, storedLinkTemplate));
            return Object.assign({ id: linkTemplateId }, linkTemplate);
        });
    }
    deleteLinkTemplate(linkTemplate) {
        return __awaiter(this, void 0, void 0, function* () {
            const [widgetOwnerId, , bosWidgetLocalId] = linkTemplate.bosWidgetId.split("/");
            const accountId = yield this._signer.getAccountId();
            if (!accountId)
                throw new Error("User is not logged in");
            const keys = [
                accountId,
                SettingsKey,
                ProjectIdKey,
                LinkTemplateKey,
                widgetOwnerId,
                WidgetKey,
                bosWidgetLocalId,
                linkTemplate.id,
            ];
            const storedLinkTemplate = {
                [SelfKey]: null,
                namespace: null,
                contextType: null,
                contextId: null,
                insertionPoint: null,
            };
            yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").set(this._buildNestedData(keys, storedLinkTemplate));
        });
    }
    setContextIdsForParser(parserGlobalId, contextsToBeAdded, contextsToBeDeleted) {
        return __awaiter(this, void 0, void 0, function* () {
            const [parserOwnerId, parserKey, parserLocalId] = parserGlobalId.split("/");
            if (parserKey !== ParserKey) {
                throw new Error("Invalid parser ID");
            }
            const addingKeys = contextsToBeAdded.map(hashObject);
            const deletingKeys = contextsToBeDeleted.map(hashObject);
            const savingData = Object.assign(Object.assign({}, Object.fromEntries(addingKeys.map((k) => [k, ""]))), Object.fromEntries(deletingKeys.map((k) => [k, null])));
            // Key example:
            // bos.dapplets.near/settings/dapplets.near/parser/social-network/contexts
            const parentKeys = [
                parserOwnerId,
                SettingsKey,
                ProjectIdKey,
                ParserKey,
                parserLocalId,
                ParserContextsKey,
            ];
            yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").set(this._buildNestedData(parentKeys, savingData));
        });
    }
    // #endregion
    _extractParserIdFromNamespace(namespace) {
        if (!namespace.startsWith(DappletsNamespace)) {
            throw new Error("Invalid namespace");
        }
        const parserGlobalId = namespace.replace(DappletsNamespace, "");
        // Example: example.near/parser/social-network
        const [parserType, accountId, entityType, parserLocalId] = parserGlobalId.split("/");
        if (entityType !== "parser" || !accountId || !parserLocalId) {
            throw new Error("Invalid namespace");
        }
        if (!SupportedParserTypes.includes(parserType)) {
            throw new Error(`Parser type "${parserType}" is not supported`);
        }
        return { parserType, accountId, parserLocalId };
    }
    _buildNestedData(keys, data) {
        const [firstKey, ...anotherKeys] = keys;
        if (anotherKeys.length === 0) {
            return {
                [firstKey]: data,
            };
        }
        else {
            return {
                [firstKey]: this._buildNestedData(anotherKeys, data),
            };
        }
    }
}
exports.SocialDbProvider = SocialDbProvider;
_SocialDbProvider_client = new WeakMap();
