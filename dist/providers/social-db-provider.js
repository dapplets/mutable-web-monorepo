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
const js_sha256_1 = require("js-sha256");
const json_stringify_deterministic_1 = __importDefault(require("json-stringify-deterministic"));
const utils_1 = require("../core/utils");
const social_db_client_1 = require("./social-db-client");
const constants_1 = require("../constants");
const DappletsNamespace = "https://dapplets.org/ns/";
const SupportedParserTypes = ["json", "bos"];
const ProjectIdKey = "dapplets.near";
const ParserKey = "parser";
const SettingsKey = "settings";
const LinkKey = "link";
const SelfKey = "";
const ParserContextsKey = "contexts";
const AppKey = "app";
const MutationKey = "mutation";
const WildcardKey = "*";
const RecursiveWildcardKey = "**";
const IndexesKey = "indexes";
const KeyDelimiter = "/";
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
    getParserConfigsForContext(contextFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            // ToDo: implement adapters loading for another types of contexts
            if (contextFilter.namespace !== constants_1.DappletsEngineNs)
                return [];
            const contextHashKey = SocialDbProvider._hashObject(contextFilter);
            const keys = [
                WildcardKey, // from any user
                SettingsKey,
                ProjectIdKey,
                ParserKey,
                WildcardKey, // any parser
                ParserContextsKey,
                contextHashKey,
            ];
            const availableKeys = yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").keys([keys.join(KeyDelimiter)]);
            const parserKeys = availableKeys
                .map((key) => key.substring(0, key.lastIndexOf(KeyDelimiter))) // discard contextHashKey
                .map((key) => key.substring(0, key.lastIndexOf(KeyDelimiter))); // discard ParserContextsKey
            const queryResult = yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").get(parserKeys);
            const parsers = [];
            for (const key of parserKeys) {
                const json = SocialDbProvider._getValueByKey(key.split(KeyDelimiter), queryResult);
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
    getAllAppIds() {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = [WildcardKey, SettingsKey, ProjectIdKey, AppKey, WildcardKey];
            const appKeys = yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").keys([keys.join(KeyDelimiter)]);
            return appKeys.map((key) => {
                const [authorId, , , , localAppId] = key.split(KeyDelimiter);
                return [authorId, AppKey, localAppId].join(KeyDelimiter);
            });
        });
    }
    getLinksByIndex(indexObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = SocialDbProvider._hashObject(indexObject);
            const key = [
                WildcardKey, // from any user
                SettingsKey,
                ProjectIdKey,
                LinkKey,
                WildcardKey, // any user link id
                IndexesKey,
                index,
            ].join(KeyDelimiter);
            // ToDo: batch requests
            const resp = yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").keys([key]);
            return resp.map((key) => {
                const [authorId, , , , id] = key.split(KeyDelimiter);
                return { id, authorId };
            });
        });
    }
    getApplication(globalAppId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [authorId, , appLocalId] = globalAppId.split(KeyDelimiter);
            const keys = [authorId, SettingsKey, ProjectIdKey, AppKey, appLocalId];
            const queryResult = yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").get([
                [...keys, RecursiveWildcardKey].join(KeyDelimiter),
            ]);
            const mutation = SocialDbProvider._getValueByKey(keys, queryResult);
            if (!(mutation === null || mutation === void 0 ? void 0 : mutation[SelfKey]))
                return null;
            return Object.assign(Object.assign({}, JSON.parse(mutation[SelfKey])), { id: globalAppId, appLocalId,
                authorId });
        });
    }
    getMutation(globalMutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [authorId, , mutationLocalId] = globalMutationId.split(KeyDelimiter);
            const keys = [
                authorId,
                SettingsKey,
                ProjectIdKey,
                MutationKey,
                mutationLocalId,
            ];
            const queryResult = yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").get([
                [...keys, RecursiveWildcardKey].join(KeyDelimiter),
            ]);
            const mutation = SocialDbProvider._getValueByKey(keys, queryResult);
            if (!mutation)
                return null;
            return {
                id: globalMutationId,
                metadata: mutation.metadata,
                apps: mutation.apps ? JSON.parse(mutation.apps) : [],
            };
        });
    }
    getMutations() {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = [
                WildcardKey, // any author id
                SettingsKey,
                ProjectIdKey,
                MutationKey,
                WildcardKey, // any mutation local id
            ];
            const queryResult = yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").get([
                [...keys, RecursiveWildcardKey].join(KeyDelimiter),
            ]);
            const mutationsByKey = SocialDbProvider._splitObjectByDepth(queryResult, keys.length);
            const mutations = Object.entries(mutationsByKey).map(([key, value]) => {
                const [accountId, , , , localMutationId] = key.split(KeyDelimiter);
                const mutationId = [accountId, MutationKey, localMutationId].join(KeyDelimiter);
                return {
                    id: mutationId,
                    metadata: value.metadata,
                    apps: JSON.parse(value.apps),
                };
            });
            return mutations;
        });
    }
    // #endregion
    // #region Write methods
    createLink(indexObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const linkId = (0, utils_1.generateGuid)();
            const accountId = yield this._signer.getAccountId();
            if (!accountId)
                throw new Error("User is not logged in");
            const index = SocialDbProvider._hashObject(indexObject);
            const keys = [accountId, SettingsKey, ProjectIdKey, LinkKey, linkId];
            const storedAppLink = {
                indexes: {
                    [index]: "",
                },
            };
            yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").set(SocialDbProvider._buildNestedData(keys, storedAppLink));
            return {
                id: linkId,
                authorId: accountId,
            };
        });
    }
    deleteUserLink(linkId) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountId = yield this._signer.getAccountId();
            if (!accountId)
                throw new Error("User is not logged in");
            // ToDo: check link ownership?
            const keys = [
                accountId,
                SettingsKey,
                ProjectIdKey,
                LinkKey,
                linkId,
                RecursiveWildcardKey,
            ];
            yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").delete([keys.join(KeyDelimiter)]);
        });
    }
    createApplication(appMetadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const [authorId, , appLocalId] = appMetadata.id.split(KeyDelimiter);
            const keys = [authorId, SettingsKey, ProjectIdKey, AppKey, appLocalId];
            const storedAppMetadata = {
                [SelfKey]: JSON.stringify({
                    targets: appMetadata.targets,
                }),
            };
            yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").set(SocialDbProvider._buildNestedData(keys, storedAppMetadata));
            return Object.assign(Object.assign({}, appMetadata), { appLocalId,
                authorId });
        });
    }
    createMutation(mutation) {
        return __awaiter(this, void 0, void 0, function* () {
            const [authorId, , mutationLocalId] = mutation.id.split(KeyDelimiter);
            const keys = [
                authorId,
                SettingsKey,
                ProjectIdKey,
                MutationKey,
                mutationLocalId,
            ];
            const storedAppMetadata = {
                metadata: mutation.metadata,
                apps: mutation.apps ? JSON.stringify(mutation.apps) : null,
            };
            yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").set(SocialDbProvider._buildNestedData(keys, storedAppMetadata));
            return mutation;
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
            yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").set(SocialDbProvider._buildNestedData(keys, storedParserConfig));
        });
    }
    setContextIdsForParser(parserGlobalId, contextsToBeAdded, contextsToBeDeleted) {
        return __awaiter(this, void 0, void 0, function* () {
            const [parserOwnerId, parserKey, parserLocalId] = parserGlobalId.split(KeyDelimiter);
            if (parserKey !== ParserKey) {
                throw new Error("Invalid parser ID");
            }
            const addingKeys = contextsToBeAdded.map(SocialDbProvider._hashObject);
            const deletingKeys = contextsToBeDeleted.map(SocialDbProvider._hashObject);
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
            yield __classPrivateFieldGet(this, _SocialDbProvider_client, "f").set(SocialDbProvider._buildNestedData(parentKeys, savingData));
        });
    }
    // #endregion
    // #region Private methods
    _extractParserIdFromNamespace(namespace) {
        if (!namespace.startsWith(DappletsNamespace)) {
            throw new Error("Invalid namespace");
        }
        const parserGlobalId = namespace.replace(DappletsNamespace, "");
        // Example: example.near/parser/social-network
        const [parserType, accountId, entityType, parserLocalId] = parserGlobalId.split(KeyDelimiter);
        if (entityType !== "parser" || !accountId || !parserLocalId) {
            throw new Error("Invalid namespace");
        }
        if (!SupportedParserTypes.includes(parserType)) {
            throw new Error(`Parser type "${parserType}" is not supported`);
        }
        return { parserType, accountId, parserLocalId };
    }
    // #endregion
    // #region Utils
    static _buildNestedData(keys, data) {
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
    static _splitObjectByDepth(obj, depth = 0, path = []) {
        if (depth === 0 || typeof obj !== "object" || obj === null) {
            return { [path.join(KeyDelimiter)]: obj };
        }
        const result = {};
        for (const key in obj) {
            const newPath = [...path, key];
            const nestedResult = this._splitObjectByDepth(obj[key], depth - 1, newPath);
            for (const nestedKey in nestedResult) {
                result[nestedKey] = nestedResult[nestedKey];
            }
        }
        return result;
    }
    /**
     * Hashes object using deterministic serializator, SHA-256 and base64url encoding
     */
    static _hashObject(obj) {
        const json = (0, json_stringify_deterministic_1.default)(obj);
        const hashBytes = js_sha256_1.sha256.create().update(json).arrayBuffer();
        return this._base64EncodeURL(hashBytes);
    }
    /**
     * Source: https://gist.github.com/themikefuller/c1de46cbbdad02645b9dc006baedf88e
     */
    static _base64EncodeURL(byteArray) {
        return btoa(Array.from(new Uint8Array(byteArray))
            .map((val) => {
            return String.fromCharCode(val);
        })
            .join(""))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/\=/g, "");
    }
    static _getValueByKey(keys, obj) {
        const [firstKey, ...anotherKeys] = keys;
        if (anotherKeys.length === 0) {
            return obj === null || obj === void 0 ? void 0 : obj[firstKey];
        }
        else {
            return this._getValueByKey(anotherKeys, obj === null || obj === void 0 ? void 0 : obj[firstKey]);
        }
    }
}
exports.SocialDbProvider = SocialDbProvider;
_SocialDbProvider_client = new WeakMap();
