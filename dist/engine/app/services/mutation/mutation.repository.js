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
exports.MutationRepository = void 0;
const local_db_service_1 = require("../local-db/local-db.service");
const social_db_service_1 = require("../social-db/social-db.service");
// ToDo: move to repository?
const ProjectIdKey = 'dapplets.near';
const SettingsKey = 'settings';
const MutationKey = 'mutation';
const WildcardKey = '*';
const RecursiveWildcardKey = '**';
const KeyDelimiter = '/';
// Local DB
const FAVORITE_MUTATION = 'favorite-mutation';
const MUTATION_LAST_USAGE = 'mutation-last-usage';
class MutationRepository {
    constructor(socialDb, localDb) {
        this.socialDb = socialDb;
        this.localDb = localDb;
    }
    getMutation(globalMutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [authorId, , mutationLocalId] = globalMutationId.split(KeyDelimiter);
            const keys = [authorId, SettingsKey, ProjectIdKey, MutationKey, mutationLocalId];
            const queryResult = yield this.socialDb.get([
                [...keys, RecursiveWildcardKey].join(KeyDelimiter),
            ]);
            const mutation = social_db_service_1.SocialDbService.getValueByKey(keys, queryResult);
            if (!mutation)
                return null;
            return {
                id: globalMutationId,
                metadata: mutation.metadata,
                apps: mutation.apps ? JSON.parse(mutation.apps) : [],
                targets: mutation.targets ? JSON.parse(mutation.targets) : [],
            };
        });
    }
    getMutations() {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = [
                WildcardKey, // any author id
                SettingsKey,
                ProjectIdKey,
                MutationKey,
                WildcardKey, // any mutation local id
            ];
            const queryResult = yield this.socialDb.get([
                [...keys, RecursiveWildcardKey].join(KeyDelimiter),
            ]);
            const mutationsByKey = social_db_service_1.SocialDbService.splitObjectByDepth(queryResult, keys.length);
            const mutations = Object.entries(mutationsByKey).map(([key, mutation]) => {
                const [accountId, , , , localMutationId] = key.split(KeyDelimiter);
                const mutationId = [accountId, MutationKey, localMutationId].join(KeyDelimiter);
                return {
                    id: mutationId,
                    metadata: mutation.metadata,
                    apps: mutation.apps ? JSON.parse(mutation.apps) : [],
                    targets: mutation.targets ? JSON.parse(mutation.targets) : [],
                };
            });
            return mutations;
        });
    }
    saveMutation(mutation) {
        return __awaiter(this, void 0, void 0, function* () {
            const [authorId, , mutationLocalId] = mutation.id.split(KeyDelimiter);
            const keys = [authorId, SettingsKey, ProjectIdKey, MutationKey, mutationLocalId];
            const storedAppMetadata = {
                metadata: mutation.metadata,
                targets: mutation.targets ? JSON.stringify(mutation.targets) : null,
                apps: mutation.apps ? JSON.stringify(mutation.apps) : null,
            };
            yield this.socialDb.set(social_db_service_1.SocialDbService.buildNestedData(keys, storedAppMetadata));
            return mutation;
        });
    }
    getFavoriteMutation() {
        return __awaiter(this, void 0, void 0, function* () {
            const key = local_db_service_1.LocalDbService.makeKey(FAVORITE_MUTATION, window.location.hostname);
            return this.localDb.getItem(key);
        });
    }
    setFavoriteMutation(mutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = local_db_service_1.LocalDbService.makeKey(FAVORITE_MUTATION, window.location.hostname);
            return this.localDb.setItem(key, mutationId);
        });
    }
    getMutationLastUsage(mutationId, hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const key = local_db_service_1.LocalDbService.makeKey(MUTATION_LAST_USAGE, mutationId, hostname);
            return (_a = (yield this.localDb.getItem(key))) !== null && _a !== void 0 ? _a : null;
        });
    }
    setMutationLastUsage(mutationId, value, hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = local_db_service_1.LocalDbService.makeKey(MUTATION_LAST_USAGE, mutationId, hostname);
            return this.localDb.setItem(key, value);
        });
    }
}
exports.MutationRepository = MutationRepository;
