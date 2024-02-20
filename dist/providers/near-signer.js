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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NearSigner = exports.DefaultGas = void 0;
const nearAPI = __importStar(require("near-api-js"));
exports.DefaultGas = '30000000000000'; // 30 TGas
/**
 * NearSigner is a wrapper around near-api-js JsonRpcProvider and WalletSelector
 * that provides a simple interface for calling and viewing contract methods.
 *
 * Methods view and call are based on near-social-vm
 * Repo: https://github.com/dapplets/near-social-vm/blob/2ba7b77ada4c8e898cc5599f7000b4e0f30991a4/src/lib/data/near.js
 */
class NearSigner {
    constructor(_selector, nodeUrl) {
        this._selector = _selector;
        this.provider = new nearAPI.providers.JsonRpcProvider({
            url: nodeUrl,
        });
    }
    getAccountId() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
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
            try {
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
            }
            catch (e) {
                // const msg = e.toString();
                // if (msg.indexOf("does not have enough balance") !== -1) {
                //   return await refreshAllowanceObj.refreshAllowance();
                // }
                throw e;
            }
        });
    }
}
exports.NearSigner = NearSigner;
