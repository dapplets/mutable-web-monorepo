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
exports.UserLinkRepository = void 0;
const caching_decorator_1 = require("caching-decorator");
const social_db_service_1 = require("../social-db/social-db.service");
const json_stringify_deterministic_1 = __importDefault(require("json-stringify-deterministic"));
const js_sha256_1 = require("js-sha256");
const ProjectIdKey = 'dapplets.near';
const SettingsKey = 'settings';
const LinkKey = 'link';
const WildcardKey = '*';
const RecursiveWildcardKey = '**';
const IndexesKey = 'indexes';
const KeyDelimiter = '/';
class UserLinkRepository {
    constructor(_socialDb, _signer // ToDo: is it necessary dependency injection?
    ) {
        this._socialDb = _socialDb;
        this._signer = _signer;
    }
    getLinksByIndex(indexObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = UserLinkRepository._hashObject(indexObject);
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
            const resp = yield this._socialDb.keys([key]);
            return resp.map((key) => {
                const [authorId, , , , id] = key.split(KeyDelimiter);
                return { id, authorId };
            });
        });
    }
    createLink(indexObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const linkId = UserLinkRepository._generateGuid();
            const accountId = yield this._signer.getAccountId();
            if (!accountId)
                throw new Error('User is not logged in');
            const index = UserLinkRepository._hashObject(indexObject);
            const keys = [accountId, SettingsKey, ProjectIdKey, LinkKey, linkId];
            const storedAppLink = {
                indexes: {
                    [index]: '',
                },
            };
            yield this._socialDb.set(social_db_service_1.SocialDbService.buildNestedData(keys, storedAppLink));
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
            yield this._socialDb.delete([keys.join(KeyDelimiter)]);
        });
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
    static _generateGuid() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    }
}
exports.UserLinkRepository = UserLinkRepository;
__decorate([
    (0, caching_decorator_1.Cacheable)({ ttl: 60000 })
], UserLinkRepository.prototype, "getLinksByIndex", null);
