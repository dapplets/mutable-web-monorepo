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
exports.LocalDbService = void 0;
const KEY_DELIMITER = ':';
/**
 * ToDo: rename to DataSource
 */
class LocalDbService {
    constructor(storage) {
        this.storage = storage;
    }
    getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.storage.getItem(key);
            return typeof item === 'string' ? JSON.parse(item) : undefined;
        });
    }
    setItem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const serializedValue = JSON.stringify(value);
            if (typeof serializedValue === 'undefined') {
                return this.storage.removeItem(key);
            }
            else {
                return this.storage.setItem(key, JSON.stringify(value));
            }
        });
    }
    static makeKey(...keys) {
        return keys.join(KEY_DELIMITER);
    }
}
exports.LocalDbService = LocalDbService;
