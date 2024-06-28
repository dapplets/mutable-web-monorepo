"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.NearSigner = exports.TGas = exports.DefaultGas = void 0;
const nearAPI = __importStar(require("near-api-js"));
const key_storage_1 = require("../social-db/key-storage");
const big_js_1 = __importDefault(require("big.js"));
const providers_1 = require("near-api-js/lib/providers");
const bn_js_1 = __importDefault(require("bn.js"));
const caching_decorator_1 = require("caching-decorator");
exports.DefaultGas = '30000000000000'; // 30 TGas
exports.TGas = (0, big_js_1.default)(10).pow(12);
/**
 * NearSigner is a wrapper around near-api-js JsonRpcProvider and WalletSelector
 * that provides a simple interface for calling and viewing contract methods.
 *
 * Methods view and call are based on near-social-vm
 * Repo: https://github.com/dapplets/near-social-vm/blob/2ba7b77ada4c8e898cc5599f7000b4e0f30991a4/src/lib/data/near.js
 */
class NearSigner {
    constructor(_selector, _localDb, _nearConfig) {
        this._selector = _selector;
        this._localDb = _localDb;
        this._nearConfig = _nearConfig;
        this.provider = new nearAPI.providers.JsonRpcProvider({
            url: _nearConfig.nodeUrl,
        });
    }
    getAccountId() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const wallet = yield (yield this._selector).wallet();
            const accounts = yield wallet.getAccounts();
            return (_b = (_a = accounts[0]) === null || _a === void 0 ? void 0 : _a.accountId) !== null && _b !== void 0 ? _b : null;
        });
    }
    view(contractName, methodName, args) {
        return __awaiter(this, void 0, void 0, function* () {
            args = args || {};
            const result = (yield this.provider.query({
                request_type: 'call_function',
                account_id: contractName,
                method_name: methodName,
                args_base64: btoa(JSON.stringify(args)),
                block_id: undefined,
                finality: 'final',
            }));
            return (result.result &&
                result.result.length > 0 &&
                JSON.parse(new TextDecoder().decode(new Uint8Array(result.result))));
        });
    }
    call(contractName, methodName, args, gas, deposit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (contractName === this._nearConfig.contractName) {
                const account = yield this._createConnectionForContract(contractName);
                // No session key for this contract
                if (!account) {
                    return this._signInAndSetCallMethod(contractName, methodName, args, gas, deposit);
                }
                // tx with deposit should be send via wallet
                if (deposit && deposit !== '0') {
                    return this._sendTxViaWallet(contractName, methodName, args, gas, deposit);
                }
                try {
                    return yield account.functionCall({
                        contractId: contractName,
                        methodName,
                        args,
                        gas: gas ? new bn_js_1.default(gas) : undefined,
                    });
                }
                catch (e) {
                    if (e instanceof providers_1.TypedError && e.type === 'NotEnoughAllowance') {
                        return this._signInAndSetCallMethod(contractName, methodName, args, gas, deposit);
                    }
                    else {
                        console.error(e);
                        throw e;
                    }
                }
            }
            return this._sendTxViaWallet(contractName, methodName, args, gas, deposit);
        });
    }
    _sendTxViaWallet(contractName, methodName, args, gas, deposit) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield (yield this._selector).wallet();
            return yield wallet.signAndSendTransaction({
                receiverId: contractName,
                actions: [
                    {
                        type: 'FunctionCall',
                        params: {
                            methodName,
                            args,
                            gas: gas !== null && gas !== void 0 ? gas : exports.DefaultGas,
                            deposit: deposit !== null && deposit !== void 0 ? deposit : '0',
                        },
                    },
                ],
            });
        });
    }
    _getKeyStoreForContract(contractId) {
        return new key_storage_1.KeyStorage(this._localDb, `${contractId}:keystore:`);
    }
    _createConnectionForContract(contractId) {
        return __awaiter(this, void 0, void 0, function* () {
            const keyStore = this._getKeyStoreForContract(contractId);
            const loggedInAccountId = yield this.getAccountId();
            if (!loggedInAccountId)
                throw new Error('Not logged in');
            const keyForContract = yield keyStore.getKey(this._nearConfig.networkId, loggedInAccountId);
            if (!keyForContract)
                return null;
            const near = yield nearAPI.connect({
                keyStore,
                networkId: this._nearConfig.networkId,
                nodeUrl: this.provider.connection.url,
                headers: {},
            });
            const account = yield near.account(loggedInAccountId);
            // two parameters of this methods are not implemented
            // see more: https://github.com/near/near-api-js/blob/45cfbec891d996915c32f66d8ddcdca540ea3645/packages/accounts/src/account.ts#L231
            const accessKey = yield account.findAccessKey(contractId, []);
            // key doesn't exist
            if (!accessKey) {
                return null;
            }
            return account;
        });
    }
    _signInAndSetCallMethod(contractName, methodName, args, gas, deposit) {
        return __awaiter(this, void 0, void 0, function* () {
            const keyPair = nearAPI.utils.KeyPair.fromRandom('ed25519');
            const allowance = nearAPI.utils.format.parseNearAmount('0.25');
            // @ts-ignore
            const accessKey = nearAPI.transactions.functionCallAccessKey(contractName, [], allowance);
            const publicKey = keyPair.getPublicKey();
            const wallet = yield this._selector.wallet();
            const walletAccount = (yield wallet.getAccounts())[0];
            const accountId = walletAccount.accountId;
            const result = yield wallet.signAndSendTransactions({
                transactions: [
                    {
                        receiverId: accountId,
                        actions: [
                            {
                                type: 'AddKey',
                                params: {
                                    publicKey: publicKey.toString(),
                                    accessKey: {
                                        // ToDo
                                        // @ts-ignore
                                        permission: accessKey.permission.functionCall,
                                    },
                                },
                            },
                        ],
                        gas: exports.TGas.mul(30),
                    },
                    {
                        receiverId: contractName,
                        actions: [
                            {
                                type: 'FunctionCall',
                                params: {
                                    methodName,
                                    args,
                                    gas: gas !== null && gas !== void 0 ? gas : exports.DefaultGas,
                                    deposit: deposit !== null && deposit !== void 0 ? deposit : '0',
                                },
                            },
                        ],
                    },
                ],
            });
            const keyStore = this._getKeyStoreForContract(contractName);
            yield keyStore.setKey(this._nearConfig.networkId, accountId, keyPair);
            localStorage.setItem(`${contractName}_wallet_auth_key`, JSON.stringify({ accountId, allKeys: [walletAccount.publicKey] }));
            return result;
        });
    }
}
exports.NearSigner = NearSigner;
__decorate([
    (0, caching_decorator_1.Cacheable)({ ttl: 1000 }) // ~ block time
], NearSigner.prototype, "view", null);
