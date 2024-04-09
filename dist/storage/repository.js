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
exports.Repository = void 0;
const KEY_DELIMITER = ':';
const FAVORITE_MUTATION = 'favorite-mutation';
const MUTATION_LAST_USAGE = 'mutation-last-usage';
class Repository {
    constructor(jsonStorage) {
        this.jsonStorage = jsonStorage;
    }
    getFavoriteMutation() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._get(FAVORITE_MUTATION);
        });
    }
    setFavoriteMutation(mutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._set(FAVORITE_MUTATION, mutationId);
        });
    }
    getMutationLastUsage(mutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this._makeKey(MUTATION_LAST_USAGE, mutationId);
            return this._get(key);
        });
    }
    setMutationLastUsage(mutationId, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this._makeKey(MUTATION_LAST_USAGE, mutationId);
            return this._set(key, value);
        });
    }
    _get(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, defaultValue = null) {
            const value = yield this.jsonStorage.getItem(key);
            return value === null ? defaultValue : value;
        });
    }
    _set(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.jsonStorage.setItem(key, value);
        });
    }
    _makeKey(...keys) {
        return keys.join(KEY_DELIMITER);
    }
}
exports.Repository = Repository;
