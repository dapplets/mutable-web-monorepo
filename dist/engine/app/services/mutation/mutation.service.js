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
exports.MutationService = void 0;
const target_service_1 = require("../target/target.service");
class MutationService {
    constructor(mutationRepository, nearConfig) {
        this.mutationRepository = mutationRepository;
        this.nearConfig = nearConfig;
        this.getLastUsedMutation = (context) => __awaiter(this, void 0, void 0, function* () {
            const allMutations = yield this.getMutationsWithSettings(context);
            const hostname = window.location.hostname;
            const lastUsedData = yield Promise.all(allMutations.map((m) => __awaiter(this, void 0, void 0, function* () {
                return ({
                    id: m.id,
                    lastUsage: yield this.mutationRepository.getMutationLastUsage(m.id, hostname),
                });
            })));
            const usedMutationsData = lastUsedData
                .filter((m) => m.lastUsage)
                .map((m) => ({ id: m.id, lastUsage: new Date(m.lastUsage).getTime() }));
            if (usedMutationsData === null || usedMutationsData === void 0 ? void 0 : usedMutationsData.length) {
                if (usedMutationsData.length === 1)
                    return usedMutationsData[0].id;
                let lastMutation = usedMutationsData[0];
                for (let i = 1; i < usedMutationsData.length; i++) {
                    if (usedMutationsData[i].lastUsage > lastMutation.lastUsage) {
                        lastMutation = usedMutationsData[i];
                    }
                }
                return lastMutation.id;
            }
            else {
                // Activate default mutation for new users
                return this.nearConfig.defaultMutationId;
            }
        });
    }
    getMutation(mutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.mutationRepository.getMutation(mutationId);
        });
    }
    getMutationsForContext(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const mutations = yield this.mutationRepository.getMutations();
            return mutations.filter((mutation) => mutation.targets.some((target) => target_service_1.TargetService.isTargetMet(target, context)));
        });
    }
    getMutationsWithSettings(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const mutations = yield this.getMutationsForContext(context);
            return Promise.all(mutations.map((mut) => this.populateMutationWithSettings(mut)));
        });
    }
    setFavoriteMutation(mutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.mutationRepository.setFavoriteMutation(mutationId);
        });
    }
    getFavoriteMutation() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.mutationRepository.getFavoriteMutation();
            return value !== null && value !== void 0 ? value : null;
        });
    }
    createMutation(mutation) {
        return __awaiter(this, void 0, void 0, function* () {
            // ToDo: move to provider?
            if (yield this.mutationRepository.getMutation(mutation.id)) {
                throw new Error('Mutation with that ID already exists');
            }
            yield this.mutationRepository.saveMutation(mutation);
            return this.populateMutationWithSettings(mutation);
        });
    }
    editMutation(mutation) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mutationRepository.saveMutation(mutation);
            return this.populateMutationWithSettings(mutation);
        });
    }
    removeMutationFromRecents(mutationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mutationRepository.setMutationLastUsage(mutationId, null, window.location.hostname);
        });
    }
    updateMutationLastUsage(mutationId, hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            // save last usage
            const currentDate = new Date().toISOString();
            yield this.mutationRepository.setMutationLastUsage(mutationId, currentDate, hostname);
            return currentDate;
        });
    }
    populateMutationWithSettings(mutation) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastUsage = yield this.mutationRepository.getMutationLastUsage(mutation.id, window.location.hostname);
            return Object.assign(Object.assign({}, mutation), { settings: {
                    lastUsage,
                } });
        });
    }
}
exports.MutationService = MutationService;
