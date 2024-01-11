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
exports.SocialDbParserConfigProvider = void 0;
const big_js_1 = __importDefault(require("big.js"));
const JsonParserNamespace = "https://dapplets.org/ns/json/";
class SocialDbParserConfigProvider {
    constructor(_signer, _contractName) {
        this._signer = _signer;
        this._contractName = _contractName;
    }
    getParserConfig(ns) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const { accountId, parserLocalId } = this._extractParserIdFromNamespace(ns);
            const queryResult = yield this._signer.view(this._contractName, "get", {
                keys: [`${accountId}/parser/${parserLocalId}/**`],
            });
            const parserConfig = (_c = (_b = (_a = queryResult[accountId]) === null || _a === void 0 ? void 0 : _a["parser"]) === null || _b === void 0 ? void 0 : _b[parserLocalId]) === null || _c === void 0 ? void 0 : _c[""];
            if (!parserConfig)
                return null;
            return JSON.parse(parserConfig);
        });
    }
    createParserConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { accountId, parserLocalId } = this._extractParserIdFromNamespace(config.namespace);
            const gas = undefined; // default gas
            const deposit = (0, big_js_1.default)(10).pow(19).mul(2000).toFixed(0); // storage deposit ToDo: calculate it dynamically
            yield this._signer.call(this._contractName, "set", {
                data: {
                    [accountId]: {
                        parser: { [parserLocalId]: { "": JSON.stringify(config) } },
                    },
                },
            }, gas, deposit);
        });
    }
    _extractParserIdFromNamespace(namespace) {
        if (!namespace.startsWith(JsonParserNamespace)) {
            throw new Error("Invalid namespace");
        }
        const parserGlobalId = namespace.replace(JsonParserNamespace, "");
        // Example: example.near/parser/social-network
        const [accountId, entityType, parserLocalId] = parserGlobalId.split("/");
        if (entityType !== "parser" || !accountId || !parserLocalId) {
            throw new Error("Invalid namespace");
        }
        return { accountId, parserLocalId };
    }
}
exports.SocialDbParserConfigProvider = SocialDbParserConfigProvider;
