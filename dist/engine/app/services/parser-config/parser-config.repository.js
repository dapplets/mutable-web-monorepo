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
exports.ParserConfigRepository = void 0;
const social_db_service_1 = require("../social-db/social-db.service");
const ProjectIdKey = 'dapplets.near';
const ParserKey = 'parser';
const SettingsKey = 'settings';
const SelfKey = '';
const KeyDelimiter = '/';
class ParserConfigRepository {
    constructor(socialDb) {
        this.socialDb = socialDb;
    }
    getParserConfig(globalParserId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            if (globalParserId === 'mweb')
                return null;
            const { accountId, parserLocalId } = this._extractParserIdFromNamespace(globalParserId);
            const queryResult = yield this.socialDb.get([
                `*/${SettingsKey}/${ProjectIdKey}/${ParserKey}/${parserLocalId}/**`,
            ]);
            const parserConfigJson = (_e = (_d = (_c = (_b = (_a = queryResult[accountId]) === null || _a === void 0 ? void 0 : _a[SettingsKey]) === null || _b === void 0 ? void 0 : _b[ProjectIdKey]) === null || _c === void 0 ? void 0 : _c[ParserKey]) === null || _d === void 0 ? void 0 : _d[parserLocalId]) === null || _e === void 0 ? void 0 : _e[SelfKey];
            if (!parserConfigJson)
                return null;
            const config = JSON.parse(parserConfigJson);
            return {
                id: globalParserId,
                parserType: config.parserType,
                contexts: config.contexts,
                targets: config.targets,
            };
        });
    }
    saveParserConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { accountId, parserLocalId } = this._extractParserIdFromNamespace(config.id);
            const keys = [accountId, SettingsKey, ProjectIdKey, ParserKey, parserLocalId];
            const storedParserConfig = {
                [SelfKey]: JSON.stringify({
                    parserType: config.parserType,
                    targets: config.targets,
                    contexts: config.contexts, // ToDo: types
                }),
            };
            yield this.socialDb.set(social_db_service_1.SocialDbService.buildNestedData(keys, storedParserConfig));
        });
    }
    _extractParserIdFromNamespace(parserGlobalId) {
        // Example: example.near/parser/social-network
        const [accountId, entityType, parserLocalId] = parserGlobalId.split(KeyDelimiter);
        if (entityType !== 'parser' || !accountId || !parserLocalId) {
            throw new Error(`Invalid namespace: ${parserGlobalId}`);
        }
        return { accountId, parserLocalId };
    }
}
exports.ParserConfigRepository = ParserConfigRepository;
