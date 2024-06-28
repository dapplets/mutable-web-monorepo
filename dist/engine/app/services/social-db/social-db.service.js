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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialDbService = void 0;
const big_js_1 = __importDefault(require("big.js"));
const KeyDelimiter = '/';
const EstimatedKeyValueSize = 40 * 3 + 8 + 12;
const EstimatedNodeSize = 40 * 2 + 8 + 10;
const TGas = (0, big_js_1.default)(10).pow(12);
const StorageCostPerByte = (0, big_js_1.default)(10).pow(19);
const MinStorageBalance = StorageCostPerByte.mul(2000);
const InitialAccountStorageBalance = StorageCostPerByte.mul(500);
const ExtraStorageBalance = StorageCostPerByte.mul(500);
const ExtraStorageForSession = (0, big_js_1.default)(10).pow(22).mul(5); // 0.05 NEAR
const isArray = (a) => Array.isArray(a);
const isObject = (o) => o === Object(o) && !isArray(o) && typeof o !== 'function';
const isString = (s) => typeof s === 'string';
const estimateDataSize = (data, prevData) => isObject(data)
    ? Object.entries(data).reduce((s, [key, value]) => {
        const prevValue = isObject(prevData) ? prevData[key] : undefined;
        return (s +
            (prevValue !== undefined
                ? estimateDataSize(value, prevValue)
                : key.length * 2 + estimateDataSize(value, undefined) + EstimatedKeyValueSize));
    }, isObject(prevData) ? 0 : EstimatedNodeSize)
    : ((data === null || data === void 0 ? void 0 : data.length) || 8) - (isString(prevData) ? prevData.length : 0);
const bigMax = (a, b) => {
    if (a && b) {
        return a.gt(b) ? a : b;
    }
    return a || b;
};
function collectKeys(obj) {
    const keys = [];
    for (const key in obj) {
        if (obj[key] === true) {
            keys.push(key);
        }
        else {
            keys.push(...collectKeys(obj[key]).map((subKey) => `${key}/${subKey}`));
        }
    }
    return keys;
}
const stringify = (s) => (isString(s) || s === null ? s : JSON.stringify(s));
const convertToStringLeaves = (data) => {
    return isObject(data)
        ? Object.entries(data).reduce((obj, [key, value]) => {
            obj[stringify(key)] = convertToStringLeaves(value);
            return obj;
        }, {})
        : stringify(data);
};
const extractKeys = (data, prefix = '') => Object.entries(data)
    .map(([key, value]) => isObject(value) ? extractKeys(value, `${prefix}${key}/`) : `${prefix}${key}`)
    .flat();
const removeDuplicates = (data, prevData) => {
    const obj = Object.entries(data).reduce((obj, [key, value]) => {
        const prevValue = isObject(prevData) ? prevData[key] : undefined;
        if (isObject(value)) {
            const newValue = isObject(prevValue) ? removeDuplicates(value, prevValue) : value;
            if (newValue !== undefined) {
                obj[key] = newValue;
            }
        }
        else if (value !== prevValue) {
            obj[key] = value;
        }
        return obj;
    }, {});
    return Object.keys(obj).length ? obj : undefined;
};
/**
 * ToDo: rename to DataSource
 */
class SocialDbService {
    constructor(_signer, _contractName) {
        this._signer = _signer;
        this._contractName = _contractName;
    }
    get(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._signer.view(this._contractName, 'get', { keys });
        });
    }
    keys(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._signer.view(this._contractName, 'keys', {
                keys,
            });
            return collectKeys(response);
        });
    }
    set(originalData) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountIds = Object.keys(originalData);
            if (accountIds.length !== 1) {
                throw new Error('Only one account can be updated at a time');
            }
            const [accountId] = accountIds;
            const signedAccountId = yield this._signer.getAccountId();
            if (!signedAccountId) {
                throw new Error('User is not logged in');
            }
            if (accountId !== signedAccountId) {
                throw new Error('Only the owner can update the account');
            }
            const accountStorage = yield this._getAccountStorage(signedAccountId);
            const availableBytes = (0, big_js_1.default)((accountStorage === null || accountStorage === void 0 ? void 0 : accountStorage.availableBytes) || '0');
            let data = originalData;
            const currentData = yield this._fetchCurrentData(data);
            data = removeDuplicates(data, currentData);
            // ToDo: check is_write_permission_granted
            const expectedDataBalance = StorageCostPerByte.mul(estimateDataSize(data, currentData))
                .add(accountStorage ? (0, big_js_1.default)(0) : InitialAccountStorageBalance)
                .add(ExtraStorageBalance);
            let deposit = bigMax(expectedDataBalance.sub(availableBytes.mul(StorageCostPerByte)), !accountStorage ? MinStorageBalance : (0, big_js_1.default)(0));
            // If deposit required add extra deposit to avoid future wallet TX confirmation
            if (!deposit.eq((0, big_js_1.default)(0))) {
                deposit = deposit.add(ExtraStorageForSession);
            }
            yield this._signer.call(this._contractName, 'set', { data }, TGas.mul(100).toFixed(0), // gas
            deposit.toFixed(0));
        });
    }
    delete(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.get(keys);
            const nullData = SocialDbService._nullifyData(data);
            yield this.set(nullData);
        });
    }
    _getAccountStorage(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this._signer.view(this._contractName, 'get_account_storage', {
                account_id: accountId,
            });
            return {
                usedBytes: resp === null || resp === void 0 ? void 0 : resp.used_bytes,
                availableBytes: resp === null || resp === void 0 ? void 0 : resp.available_bytes,
            };
        });
    }
    _fetchCurrentData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = extractKeys(data);
            return yield this._signer.view(this._contractName, 'get', { keys });
        });
    }
    // Utils
    static _nullifyData(data) {
        return Object.fromEntries(Object.entries(data).map(([key, val]) => {
            const nullVal = typeof val === 'object' ? this._nullifyData(val) : null;
            return [key, nullVal];
        }));
    }
    static buildNestedData(keys, data) {
        const [firstKey, ...anotherKeys] = keys;
        if (anotherKeys.length === 0) {
            return {
                [firstKey]: data,
            };
        }
        else {
            return {
                [firstKey]: this.buildNestedData(anotherKeys, data),
            };
        }
    }
    static splitObjectByDepth(obj, depth = 0, path = []) {
        if (depth === 0 || typeof obj !== 'object' || obj === null) {
            return { [path.join(KeyDelimiter)]: obj };
        }
        const result = {};
        for (const key in obj) {
            const newPath = [...path, key];
            const nestedResult = this.splitObjectByDepth(obj[key], depth - 1, newPath);
            for (const nestedKey in nestedResult) {
                result[nestedKey] = nestedResult[nestedKey];
            }
        }
        return result;
    }
    static getValueByKey(keys, obj) {
        const [firstKey, ...anotherKeys] = keys;
        if (anotherKeys.length === 0) {
            return obj === null || obj === void 0 ? void 0 : obj[firstKey];
        }
        else {
            return this.getValueByKey(anotherKeys, obj === null || obj === void 0 ? void 0 : obj[firstKey]);
        }
    }
}
exports.SocialDbService = SocialDbService;
