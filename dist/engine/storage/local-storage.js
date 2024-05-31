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
exports.LocalStorage = void 0;
class LocalStorage {
    constructor(_keyPrefix = 'mutableweb') {
        this._keyPrefix = _keyPrefix;
    }
    getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return localStorage.getItem(this._makeKey(key));
        });
    }
    setItem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            localStorage.setItem(this._makeKey(key), value);
        });
    }
    removeItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            localStorage.removeItem(this._makeKey(key));
        });
    }
    _makeKey(key) {
        return this._keyPrefix + ':' + key;
    }
}
exports.LocalStorage = LocalStorage;
