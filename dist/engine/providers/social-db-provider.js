"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialDbProvider = void 0;
const js_sha256_1 = require("js-sha256");
const json_stringify_deterministic_1 = __importDefault(require("json-stringify-deterministic"));
const caching_decorator_1 = require("caching-decorator");
const social_db_client_1 = require("./social-db-client");
const ProjectIdKey = 'dapplets.near';
const ParserKey = 'parser';
const SettingsKey = 'settings';
const LinkKey = 'link';
const SelfKey = '';
const AppKey = 'app';
const MutationKey = 'mutation';
const WildcardKey = '*';
const RecursiveWildcardKey = '**';
const IndexesKey = 'indexes';
const KeyDelimiter = '/';
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
        this.client = new social_db_client_1.SocialDbClient(_signer, _contractName);
    }
    // #region Read methods
    getParserConfig(globalParserId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            if (globalParserId === 'mweb')
                return null;
            const { accountId, parserLocalId } = this._extractParserIdFromNamespace(globalParserId);
            const queryResult = yield this.client.get([
                `*/${SettingsKey}/${ProjectIdKey}/${ParserKey}/${parserLocalId}/**`,
            ]);
            const parserConfigJson = (_e = (_d = (_c = (_b = (_a = queryResult[accountId]) === null || _a === void 0 ? void 0 : _a[SettingsKey]) === null || _b === void 0 ? void 0 : _b[ProjectIdKey]) === null || _c === void 0 ? void 0 : _c[ParserKey]) === null || _d === void 0 ? void 0 : _d[parserLocalId]) === null || _e === void 0 ? void 0 : _e[SelfKey];
            if (!parserConfigJson)
                return null;
            const config = JSON.parse(parserConfigJson);
            return {
                id: globalParserId,
                parserType: config.parserType,
                contexts: config.contexts,
                targets: config.targets,
            };
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
            const resp = yield this.client.keys([key]);
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
            const queryResult = yield this.client.get([[...keys, RecursiveWildcardKey].join(KeyDelimiter)]);
            const app = SocialDbProvider._getValueByKey(keys, queryResult);
            if (!(app === null || app === void 0 ? void 0 : app[SelfKey]))
                return null;
            return Object.assign(Object.assign({}, JSON.parse(app[SelfKey])), { metadata: app.metadata, id: globalAppId, appLocalId,
                authorId });
        });
    }
    getApplications() {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = [
                WildcardKey, // any author id
                SettingsKey,
                ProjectIdKey,
                AppKey,
                WildcardKey, // any app local id
            ];
            const queryResult = yield this.client.get([[...keys, RecursiveWildcardKey].join(KeyDelimiter)]);
            const appsByKey = SocialDbProvider._splitObjectByDepth(queryResult, keys.length);
            const apps = Object.entries(appsByKey).map(([key, app]) => {
                const [authorId, , , , appLocalId] = key.split(KeyDelimiter);
                const globalAppId = [authorId, AppKey, appLocalId].join(KeyDelimiter);
                return Object.assign(Object.assign({}, JSON.parse(app[SelfKey])), { metadata: app.metadata, id: globalAppId, appLocalId,
                    authorId });
            });
            return apps;
        });
    }
    getMutation(globalMutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [authorId, , mutationLocalId] = globalMutationId.split(KeyDelimiter);
            const keys = [authorId, SettingsKey, ProjectIdKey, MutationKey, mutationLocalId];
            const queryResult = yield this.client.get([[...keys, RecursiveWildcardKey].join(KeyDelimiter)]);
            const mutation = SocialDbProvider._getValueByKey(keys, queryResult);
            if (!mutation)
                return null;
            return {
                id: globalMutationId,
                metadata: mutation.metadata,
                apps: mutation.apps ? JSON.parse(mutation.apps) : [],
                targets: mutation.targets ? JSON.parse(mutation.targets) : [],
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
            const queryResult = yield this.client.get([[...keys, RecursiveWildcardKey].join(KeyDelimiter)]);
            const mutationsByKey = SocialDbProvider._splitObjectByDepth(queryResult, keys.length);
            const mutations = Object.entries(mutationsByKey).map(([key, mutation]) => {
                const [accountId, , , , localMutationId] = key.split(KeyDelimiter);
                const mutationId = [accountId, MutationKey, localMutationId].join(KeyDelimiter);
                return {
                    id: mutationId,
                    metadata: mutation.metadata,
                    apps: mutation.apps ? JSON.parse(mutation.apps) : [],
                    targets: mutation.targets ? JSON.parse(mutation.targets) : [],
                };
            });
            return mutations;
        });
    }
    // #endregion
    // #region Write methods
    createLink(indexObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const linkId = SocialDbProvider._generateGuid();
            const accountId = yield this._signer.getAccountId();
            if (!accountId)
                throw new Error('User is not logged in');
            const index = SocialDbProvider._hashObject(indexObject);
            const keys = [accountId, SettingsKey, ProjectIdKey, LinkKey, linkId];
            const storedAppLink = {
                indexes: {
                    [index]: '',
                },
            };
            yield this.client.set(SocialDbProvider._buildNestedData(keys, storedAppLink));
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
                throw new Error('User is not logged in');
            // ToDo: check link ownership?
            const keys = [accountId, SettingsKey, ProjectIdKey, LinkKey, linkId, RecursiveWildcardKey];
            yield this.client.delete([keys.join(KeyDelimiter)]);
        });
    }
    saveApplication(appMetadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const [authorId, , appLocalId] = appMetadata.id.split(KeyDelimiter);
            const keys = [authorId, SettingsKey, ProjectIdKey, AppKey, appLocalId];
            const storedAppMetadata = {
                [SelfKey]: JSON.stringify({
                    targets: appMetadata.targets,
                }),
                metadata: appMetadata.metadata,
            };
            yield this.client.set(SocialDbProvider._buildNestedData(keys, storedAppMetadata));
            return Object.assign(Object.assign({}, appMetadata), { appLocalId,
                authorId });
        });
    }
    saveMutation(mutation) {
        return __awaiter(this, void 0, void 0, function* () {
            const [authorId, , mutationLocalId] = mutation.id.split(KeyDelimiter);
            const keys = [authorId, SettingsKey, ProjectIdKey, MutationKey, mutationLocalId];
            const storedAppMetadata = {
                metadata: mutation.metadata,
                targets: mutation.targets ? JSON.stringify(mutation.targets) : null,
                apps: mutation.apps ? JSON.stringify(mutation.apps) : null,
            };
            yield this.client.set(SocialDbProvider._buildNestedData(keys, storedAppMetadata));
            return mutation;
        });
    }
    saveParserConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { accountId, parserLocalId } = this._extractParserIdFromNamespace(config.id);
            const keys = [accountId, SettingsKey, ProjectIdKey, ParserKey, parserLocalId];
            const storedParserConfig = {
                [SelfKey]: JSON.stringify({
                    parserType: config.parserType,
                    targets: config.targets,
                    contexts: config.contexts, // ToDo: types
                }),
            };
            yield this.client.set(SocialDbProvider._buildNestedData(keys, storedParserConfig));
        });
    }
    // #endregion
    // #region Private methods
    _extractParserIdFromNamespace(parserGlobalId) {
        // Example: example.near/parser/social-network
        const [accountId, entityType, parserLocalId] = parserGlobalId.split(KeyDelimiter);
        if (entityType !== 'parser' || !accountId || !parserLocalId) {
            throw new Error(`Invalid namespace: ${parserGlobalId}`);
        }
        return { accountId, parserLocalId };
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
        if (depth === 0 || typeof obj !== 'object' || obj === null) {
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
            .join(''))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/\=/g, '');
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
    static _generateGuid() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    }
}
exports.SocialDbProvider = SocialDbProvider;
__decorate([
    (0, caching_decorator_1.Cacheable)({ ttl: 60000 })
], SocialDbProvider.prototype, "getLinksByIndex", null);
