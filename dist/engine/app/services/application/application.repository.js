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
exports.ApplicationRepository = void 0;
const local_db_service_1 = require("../local-db/local-db.service");
const social_db_service_1 = require("../social-db/social-db.service");
// SocialDB
const ProjectIdKey = 'dapplets.near';
const SettingsKey = 'settings';
const SelfKey = '';
const AppKey = 'app';
const WildcardKey = '*';
const RecursiveWildcardKey = '**';
const KeyDelimiter = '/';
// LocalDB
const STOPPED_APPS = 'stopped-apps';
class ApplicationRepository {
    constructor(socialDb, localDb) {
        this.socialDb = socialDb;
        this.localDb = localDb;
    }
    getApplication(globalAppId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [authorId, , appLocalId] = globalAppId.split(KeyDelimiter);
            const keys = [authorId, SettingsKey, ProjectIdKey, AppKey, appLocalId];
            const queryResult = yield this.socialDb.get([
                [...keys, RecursiveWildcardKey].join(KeyDelimiter),
            ]);
            const app = social_db_service_1.SocialDbService.getValueByKey(keys, queryResult);
            if (!(app === null || app === void 0 ? void 0 : app[SelfKey]))
                return null;
            return Object.assign(Object.assign({}, JSON.parse(app[SelfKey])), { metadata: app.metadata, id: globalAppId, appLocalId,
                authorId });
        });
    }
    getApplications() {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = [
                WildcardKey, // any author id
                SettingsKey,
                ProjectIdKey,
                AppKey,
                WildcardKey, // any app local id
            ];
            const queryResult = yield this.socialDb.get([
                [...keys, RecursiveWildcardKey].join(KeyDelimiter),
            ]);
            const appsByKey = social_db_service_1.SocialDbService.splitObjectByDepth(queryResult, keys.length);
            const apps = Object.entries(appsByKey).map(([key, app]) => {
                const [authorId, , , , appLocalId] = key.split(KeyDelimiter);
                const globalAppId = [authorId, AppKey, appLocalId].join(KeyDelimiter);
                return Object.assign(Object.assign({}, JSON.parse(app[SelfKey])), { metadata: app.metadata, id: globalAppId, appLocalId,
                    authorId });
            });
            return apps;
        });
    }
    saveApplication(appMetadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const [authorId, , appLocalId] = appMetadata.id.split(KeyDelimiter);
            const keys = [authorId, SettingsKey, ProjectIdKey, AppKey, appLocalId];
            const storedAppMetadata = {
                [SelfKey]: JSON.stringify({
                    targets: appMetadata.targets,
                }),
                metadata: appMetadata.metadata,
            };
            yield this.socialDb.set(social_db_service_1.SocialDbService.buildNestedData(keys, storedAppMetadata));
            return Object.assign(Object.assign({}, appMetadata), { appLocalId,
                authorId });
        });
    }
    getAppEnabledStatus(mutationId, appId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const key = local_db_service_1.LocalDbService.makeKey(STOPPED_APPS, mutationId, appId);
            return (_a = (yield this.localDb.getItem(key))) !== null && _a !== void 0 ? _a : true; // app is active by default
        });
    }
    setAppEnabledStatus(mutationId, appId, isEnabled) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = local_db_service_1.LocalDbService.makeKey(STOPPED_APPS, mutationId, appId);
            return this.localDb.setItem(key, isEnabled);
        });
    }
}
exports.ApplicationRepository = ApplicationRepository;
