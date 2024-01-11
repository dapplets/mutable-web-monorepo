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
exports.SocialDbLinkProvider = void 0;
const big_js_1 = __importDefault(require("big.js"));
const js_sha256_1 = require("js-sha256");
const json_stringify_deterministic_1 = __importDefault(require("json-stringify-deterministic"));
class SocialDbLinkProvider {
    constructor(_signer, _contractName) {
        this._signer = _signer;
        this._contractName = _contractName;
    }
    getLinksForContext(context) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // JSON-configured parsers require id for the context
            if (!context.id && context.namespaceURI.startsWith("https://dapplets.org/ns/json/")) {
                return [];
            }
            // Links for all contexts of the specific type
            const contextTypeLinks = {
                namespace: context.namespaceURI,
                contextType: context.tagName.replace("--", "/widget/"), // ToDo: how to escape slashes?
                contextId: null,
            };
            const rawKeys = [contextTypeLinks];
            // Links for specific contexts
            if ((_a = context.parsedContext) === null || _a === void 0 ? void 0 : _a.id) {
                const contextIdLinks = {
                    namespace: context.namespaceURI,
                    contextType: context.tagName.replace("--", "/widget/"), // ToDo: how to escape slashes?
                    contextId: (_b = context.parsedContext) === null || _b === void 0 ? void 0 : _b.id,
                };
                rawKeys.push(contextIdLinks);
            }
            const keys = rawKeys
                .map((indexKeyData) => (0, js_sha256_1.sha256)((0, json_stringify_deterministic_1.default)(indexKeyData)))
                .map((indexKey) => `*/link/${indexKey}/**`);
            const queryResult = yield this._signer.view(this._contractName, "get", {
                keys,
            });
            const userLinksOutput = [];
            for (const accountId in queryResult) {
                const userLinks = queryResult[accountId]["link"];
                for (const linkKey in userLinks) {
                    for (const index in userLinks[linkKey]) {
                        const link = userLinks[linkKey][index];
                        const userLink = {
                            namespace: link.namespace,
                            contextType: link.contextType,
                            contextId: link.contextId,
                            insertionPoint: link.insertionPoint,
                            insertionType: link.insertionType,
                            component: link.component,
                        };
                        userLinksOutput.push(userLink);
                    }
                }
            }
            return userLinksOutput;
        });
    }
    createLink(link) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const indexKeyData = {
                namespace: link.namespace,
                contextType: link.contextType,
                contextId: (_a = link.contextId) !== null && _a !== void 0 ? _a : null,
            };
            const indexKey = (0, js_sha256_1.sha256)((0, json_stringify_deterministic_1.default)(indexKeyData));
            const accountId = yield this._signer.getAccountId();
            if (!accountId)
                throw new Error("User is not logged in");
            const existingKeys = yield this._signer.view(this._contractName, "keys", {
                keys: [`${accountId}/link/${indexKey}/*`],
            });
            const indexes = Object.keys((_d = (_c = (_b = existingKeys === null || existingKeys === void 0 ? void 0 : existingKeys[accountId]) === null || _b === void 0 ? void 0 : _b["link"]) === null || _c === void 0 ? void 0 : _c[indexKey]) !== null && _d !== void 0 ? _d : {});
            const lastIndex = indexes
                .map((index) => parseInt(index))
                .sort()
                .pop();
            const nextIndex = (lastIndex === undefined ? 0 : lastIndex + 1).toString();
            const gas = undefined; // default gas
            const deposit = (0, big_js_1.default)(10).pow(19).mul(2000).toFixed(0); // storage deposit ToDo: calculate it dynamically
            yield this._signer.call(this._contractName, "set", {
                data: { [accountId]: { link: { [indexKey]: { [nextIndex]: link } } } },
            }, gas, deposit);
        });
    }
}
exports.SocialDbLinkProvider = SocialDbLinkProvider;
/*
Example of the data structure in the smart contract:
{
    'dapplets.near': {
        link: {
            '3a643433173c20a6df872e157ea4c3c87fabfeb8ff5080aae1731545be557785': {
                '0': {
                    namespace: 'https://dapplets.org/ns/json/dapplets.near/parser/twitter',
                    contextType: 'post',
                    contextType: '82371873216372',
                    insertionPoint: 'southPanel',
                    insertionType: 'after',
                    component: 'dapplets.near/widget/Dog'
                }
            }
        }
    }
}
*/
