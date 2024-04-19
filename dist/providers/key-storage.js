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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyStorage = void 0;
const near_api_js_1 = require("near-api-js");
const LOCAL_STORAGE_KEY_PREFIX = 'near-api-js:keystore:';
class KeyStorage extends near_api_js_1.keyStores.KeyStore {
    constructor(_storage, keyStorePrefix) {
        super();
        this._storage = _storage;
        this.prefix = keyStorePrefix !== null && keyStorePrefix !== void 0 ? keyStorePrefix : LOCAL_STORAGE_KEY_PREFIX;
    }
    setKey(networkId, accountId, keyPair) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageKey = this.storageKeyForSecretKey(networkId, accountId);
            yield this._storage.setItem(storageKey, keyPair.toString());
            yield this.registerStorageKey(storageKey);
        });
    }
    getKey(networkId, accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.storageKeyForSecretKey(networkId, accountId);
            const result = yield this._storage.getItem(key);
            if (!result) {
                return null;
            }
            return near_api_js_1.KeyPair.fromString(result);
        });
    }
    removeKey(networkId, accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageKey = this.storageKeyForSecretKey(networkId, accountId);
            yield this._storage.setItem(storageKey, undefined);
            yield this.unregisterStorageKey(storageKey);
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = yield this.storageKeys();
            for (const key of keys) {
                if (key.startsWith(this.prefix)) {
                    yield this._storage.setItem(key, undefined);
                }
            }
            yield this._storage.setItem(this.storageKeyForStorageKeysArray(), undefined);
        });
    }
    getNetworks() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = new Set();
            const keys = yield this.storageKeys();
            for (const key of keys) {
                if (key.startsWith(this.prefix)) {
                    const parts = key.substring(this.prefix.length).split(':');
                    result.add(parts[1]);
                }
            }
            return Array.from(result.values());
        });
    }
    getAccounts(networkId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = new Array();
            const keys = yield this.storageKeys();
            for (const key of keys) {
                if (key.startsWith(this.prefix)) {
                    const parts = key.substring(this.prefix.length).split(':');
                    if (parts[1] === networkId) {
                        result.push(parts[0]);
                    }
                }
            }
            return result;
        });
    }
    storageKeyForSecretKey(networkId, accountId) {
        return `${this.prefix}${accountId}:${networkId}`;
    }
    storageKeyForStorageKeysArray() {
        return `${this.prefix}storagekeys`;
    }
    storageKeys() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = (yield this._storage.getItem(this.storageKeyForStorageKeysArray()))) !== null && _a !== void 0 ? _a : [];
        });
    }
    registerStorageKey(storageKey) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const storageKeysKey = this.storageKeyForStorageKeysArray();
            const allStorageKeys = (_a = (yield this._storage.getItem(storageKeysKey))) !== null && _a !== void 0 ? _a : [];
            yield this._storage.setItem(storageKeysKey, [...allStorageKeys, storageKey]);
        });
    }
    unregisterStorageKey(storageKey) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const storageKeysKey = this.storageKeyForStorageKeysArray();
            const allStorageKeys = (_a = (yield this._storage.getItem(storageKeysKey))) !== null && _a !== void 0 ? _a : [];
            yield this._storage.setItem(storageKeysKey, allStorageKeys.filter((key) => key !== storageKey));
        });
    }
}
exports.KeyStorage = KeyStorage;
