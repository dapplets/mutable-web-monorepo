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
exports.SocialDbProvider = void 0;
const utils_1 = require("../core/utils");
const DappletsNamespace = "https://dapplets.org/ns/";
const SupportedParserTypes = ["json", "bos"];
const ProjectIdKey = "dapplets.near";
const ParserKey = "parser";
const SettingsKey = "settings";
const LinkKey = "link";
const WidgetKey = "widget";
const SelfKey = "";
const LinkTemplateKey = "linkTemplate";
/**
 * All Mutable Web data is stored in the Social DB contract in `settings` namespace.
 * More info about the schema is here:
 * https://github.com/NearSocial/standards/blob/8713aed325226db5cf97ab9744ba78b561cc377b/types/settings/Settings.md
 *
 * Example of a data stored in the contract is here:
 * /docs/social-db-reference.json
 */
class SocialDbProvider {
    constructor(_signer, _contractName) {
        this._signer = _signer;
        this._contractName = _contractName;
    }
    getParserConfig(ns) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            const { accountId, parserLocalId } = this._extractParserIdFromNamespace(ns);
            const queryResult = yield this._signer.view(this._contractName, "get", {
                keys: [
                    `*/${SettingsKey}/${ProjectIdKey}/${ParserKey}/${parserLocalId}/**`,
                ],
            });
            const parserConfigJson = (_e = (_d = (_c = (_b = (_a = queryResult[accountId]) === null || _a === void 0 ? void 0 : _a[SettingsKey]) === null || _b === void 0 ? void 0 : _b[ProjectIdKey]) === null || _c === void 0 ? void 0 : _c[ParserKey]) === null || _d === void 0 ? void 0 : _d[parserLocalId]) === null || _e === void 0 ? void 0 : _e[SelfKey];
            if (!parserConfigJson)
                return null;
            return JSON.parse(parserConfigJson);
        });
    }
    createParserConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { accountId, parserLocalId } = this._extractParserIdFromNamespace(config.namespace);
            const gas = undefined; // default gas
            const deposit = "20000000000000000000000"; // 0.02 NEAR
            yield this._signer.call(this._contractName, "set", {
                data: {
                    [accountId]: {
                        [SettingsKey]: {
                            [ProjectIdKey]: {
                                [ParserKey]: {
                                    [parserLocalId]: {
                                        [SelfKey]: JSON.stringify(config),
                                    },
                                },
                            },
                        },
                    },
                },
            }, gas, deposit);
        });
    }
    getLinksForContext(context) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // JSON-configured parsers require id for the context
            if (!context.id &&
                context.namespaceURI.startsWith("https://dapplets.org/ns/json/")) {
                return [];
            }
            // ToDo: index links by context/widget/contextType/etc.
            // ToDo: fix GasLimitExceeded error using Social DB API
            // ToDo: cache the query
            // Fetch all links from every user
            const resp = yield this._signer.view(this._contractName, "get", {
                keys: [`*/${SettingsKey}/${ProjectIdKey}/${LinkKey}/*/${WidgetKey}/*/**`],
            });
            const userLinksOutput = [];
            for (const accountId in resp) {
                const widgetOwners = resp[accountId][SettingsKey][ProjectIdKey][LinkKey];
                for (const widgetOwnerId in widgetOwners) {
                    const widgets = widgetOwners[widgetOwnerId][WidgetKey];
                    for (const widgetLocalId in widgets) {
                        const userLinks = widgets[widgetLocalId];
                        for (const linkId in userLinks) {
                            const link = userLinks[linkId];
                            // Include only suitable links
                            if (link.namespace && link.namespace !== context.namespaceURI)
                                continue;
                            if (link.contextType && link.contextType !== context.tagName)
                                continue;
                            if (link.contextId && link.contextId !== context.id)
                                continue;
                            const userLink = {
                                id: linkId,
                                namespace: link.namespace,
                                contextType: link.contextType,
                                contextId: (_a = link.contextId) !== null && _a !== void 0 ? _a : null,
                                insertionPoint: link.insertionPoint,
                                bosWidgetId: `${widgetOwnerId}/${WidgetKey}/${widgetLocalId}`,
                                authorId: accountId,
                            };
                            userLinksOutput.push(userLink);
                        }
                    }
                }
            }
            return userLinksOutput;
        });
    }
    createLink(link) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const linkId = (0, utils_1.generateGuid)();
            const [widgetOwnerId, , bosWidgetLocalId] = link.bosWidgetId.split("/");
            const accountId = yield this._signer.getAccountId();
            if (!accountId)
                throw new Error("User is not logged in");
            const gas = undefined; // default gas
            const deposit = "20000000000000000000000"; // 0.02 NEAR
            yield this._signer.call(this._contractName, "set", {
                data: {
                    [accountId]: {
                        [SettingsKey]: {
                            [ProjectIdKey]: {
                                [LinkKey]: {
                                    [widgetOwnerId]: {
                                        [WidgetKey]: {
                                            [bosWidgetLocalId]: {
                                                [linkId]: {
                                                    namespace: link.namespace,
                                                    contextType: link.contextType,
                                                    contextId: (_a = link.contextId) !== null && _a !== void 0 ? _a : null,
                                                    insertionPoint: link.insertionPoint,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }, gas, deposit);
            return Object.assign(Object.assign({ id: linkId }, link), { authorId: accountId });
        });
    }
    deleteUserLink(userLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const [widgetOwnerId, , bosWidgetLocalId] = userLink.bosWidgetId.split("/");
            const accountId = yield this._signer.getAccountId();
            if (!accountId)
                throw new Error("User is not logged in");
            const gas = undefined; // default gas
            const deposit = "20000000000000000000000"; // 0.02 NEAR
            yield this._signer.call(this._contractName, "set", {
                data: {
                    [accountId]: {
                        [SettingsKey]: {
                            [ProjectIdKey]: {
                                [LinkKey]: {
                                    [widgetOwnerId]: {
                                        [WidgetKey]: {
                                            [bosWidgetLocalId]: {
                                                [userLink.id]: {
                                                    [SelfKey]: null,
                                                    namespace: null,
                                                    contextType: null,
                                                    contextId: null,
                                                    insertionPoint: null,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }, gas, deposit);
        });
    }
    getLinkTemplates(bosWidgetId) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            const [ownerId, , bosWidgetLocalId] = bosWidgetId.split("/");
            const resp = yield this._signer.view(this._contractName, "get", {
                keys: [
                    `${ownerId}/${SettingsKey}/${ProjectIdKey}/${LinkTemplateKey}/${ownerId}/${WidgetKey}/${bosWidgetLocalId}/**`,
                ],
            });
            const linkTemplates = (_f = (_e = (_d = (_c = (_b = (_a = resp[ownerId]) === null || _a === void 0 ? void 0 : _a[SettingsKey]) === null || _b === void 0 ? void 0 : _b[ProjectIdKey]) === null || _c === void 0 ? void 0 : _c[LinkTemplateKey]) === null || _d === void 0 ? void 0 : _d[ownerId]) === null || _e === void 0 ? void 0 : _e[WidgetKey]) === null || _f === void 0 ? void 0 : _f[bosWidgetLocalId];
            if (!linkTemplates)
                return [];
            const linksOutput = [];
            for (const linkTemplateId in linkTemplates) {
                const link = linkTemplates[linkTemplateId];
                const userLink = {
                    id: linkTemplateId,
                    namespace: link.namespace,
                    contextType: link.contextType,
                    contextId: link.contextId,
                    insertionPoint: link.insertionPoint,
                    bosWidgetId: `${ownerId}/${WidgetKey}/${bosWidgetLocalId}`,
                };
                linksOutput.push(userLink);
            }
            return linksOutput;
        });
    }
    createLinkTemplate(linkTemplate) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const linkTemplateId = (0, utils_1.generateGuid)();
            const [widgetOwnerId, , bosWidgetLocalId] = linkTemplate.bosWidgetId.split("/");
            const accountId = yield this._signer.getAccountId();
            if (!accountId)
                throw new Error("User is not logged in");
            const gas = undefined; // default gas
            const deposit = "20000000000000000000000"; // 0.02 NEAR
            yield this._signer.call(this._contractName, "set", {
                data: {
                    [accountId]: {
                        [SettingsKey]: {
                            [ProjectIdKey]: {
                                [LinkTemplateKey]: {
                                    [widgetOwnerId]: {
                                        [WidgetKey]: {
                                            [bosWidgetLocalId]: {
                                                [linkTemplateId]: {
                                                    namespace: linkTemplate.namespace,
                                                    contextType: linkTemplate.contextType,
                                                    contextId: (_a = linkTemplate.contextId) !== null && _a !== void 0 ? _a : null,
                                                    insertionPoint: linkTemplate.insertionPoint,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }, gas, deposit);
            return Object.assign({ id: linkTemplateId }, linkTemplate);
        });
    }
    deleteLinkTemplate(linkTemplate) {
        return __awaiter(this, void 0, void 0, function* () {
            const [widgetOwnerId, , bosWidgetLocalId] = linkTemplate.bosWidgetId.split("/");
            const accountId = yield this._signer.getAccountId();
            if (!accountId)
                throw new Error("User is not logged in");
            const gas = undefined; // default gas
            const deposit = "20000000000000000000000"; // 0.02 NEAR // ToDo: storage deposit ToDo: calculate it dynamically
            yield this._signer.call(this._contractName, "set", {
                data: {
                    [accountId]: {
                        [SettingsKey]: {
                            [ProjectIdKey]: {
                                [LinkTemplateKey]: {
                                    [widgetOwnerId]: {
                                        [WidgetKey]: {
                                            [bosWidgetLocalId]: {
                                                [linkTemplate.id]: {
                                                    [SelfKey]: null,
                                                    namespace: null,
                                                    contextType: null,
                                                    contextId: null,
                                                    insertionPoint: null,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }, gas, deposit);
        });
    }
    _extractParserIdFromNamespace(namespace) {
        if (!namespace.startsWith(DappletsNamespace)) {
            throw new Error("Invalid namespace");
        }
        const parserGlobalId = namespace.replace(DappletsNamespace, "");
        // Example: example.near/parser/social-network
        const [parserType, accountId, entityType, parserLocalId] = parserGlobalId.split("/");
        if (entityType !== "parser" || !accountId || !parserLocalId) {
            throw new Error("Invalid namespace");
        }
        if (!SupportedParserTypes.includes(parserType)) {
            throw new Error(`Parser type "${parserType}" is not supported`);
        }
        return { parserType, accountId, parserLocalId };
    }
}
exports.SocialDbProvider = SocialDbProvider;
