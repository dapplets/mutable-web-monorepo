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
exports.SocialDbClient = void 0;
const big_js_1 = __importDefault(require("big.js"));
const EstimatedKeyValueSize = 40 * 3 + 8 + 12;
const EstimatedNodeSize = 40 * 2 + 8 + 10;
const TGas = (0, big_js_1.default)(10).pow(12);
const StorageCostPerByte = (0, big_js_1.default)(10).pow(19);
const MinStorageBalance = StorageCostPerByte.mul(2000);
const InitialAccountStorageBalance = StorageCostPerByte.mul(500);
const ExtraStorageBalance = StorageCostPerByte.mul(500);
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
class SocialDbClient {
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
    set(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountIds = Object.keys(data);
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
            // ToDo: fetch current data from the contract
            //       and compare it with the new data to calculate storage cost
            const currentData = {};
            const availableBytes = (0, big_js_1.default)((accountStorage === null || accountStorage === void 0 ? void 0 : accountStorage.availableBytes) || '0');
            const expectedDataBalance = StorageCostPerByte.mul(estimateDataSize(data, currentData))
                .add(accountStorage ? (0, big_js_1.default)(0) : InitialAccountStorageBalance)
                .add(ExtraStorageBalance);
            const deposit = bigMax(expectedDataBalance.sub(availableBytes.mul(StorageCostPerByte)), !accountStorage ? MinStorageBalance : (0, big_js_1.default)(0));
            yield this._signer.call(this._contractName, 'set', { data }, TGas.mul(100).toFixed(0), // gas
            deposit.toFixed(0));
        });
    }
    delete(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.get(keys);
            const nullData = SocialDbClient._nullifyData(data);
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
    // Utils
    static _nullifyData(data) {
        return Object.fromEntries(Object.entries(data).map(([key, val]) => {
            const nullVal = typeof val === 'object' ? this._nullifyData(val) : null;
            return [key, nullVal];
        }));
    }
}
exports.SocialDbClient = SocialDbClient;
