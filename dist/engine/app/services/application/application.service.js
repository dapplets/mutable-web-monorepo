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
exports.ApplicationService = void 0;
const target_service_1 = require("../target/target.service");
class ApplicationService {
    constructor(applicationRepository) {
        this.applicationRepository = applicationRepository;
    }
    getApplications() {
        return this.applicationRepository.getApplications();
    }
    getApplication(appId) {
        return this.applicationRepository.getApplication(appId);
    }
    getAppEnabledStatus(mutationId, appId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.applicationRepository.getAppEnabledStatus(mutationId, appId);
        });
    }
    filterSuitableApps(appsToCheck, context) {
        const suitableApps = [];
        for (const app of appsToCheck) {
            const suitableTargets = app.targets.filter((target) => target_service_1.TargetService.isTargetMet(target, context));
            if (suitableTargets.length > 0) {
                suitableApps.push(Object.assign(Object.assign({}, app), { targets: suitableTargets }));
            }
        }
        return suitableApps;
    }
    enableAppInMutation(mutationId, appId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.applicationRepository.setAppEnabledStatus(mutationId, appId, true);
        });
    }
    disableAppInMutation(mutationId, appId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.applicationRepository.setAppEnabledStatus(mutationId, appId, false);
        });
    }
    populateAppWithSettings(mutationId, app) {
        return __awaiter(this, void 0, void 0, function* () {
            return Object.assign(Object.assign({}, app), { settings: {
                    isEnabled: yield this.applicationRepository.getAppEnabledStatus(mutationId, app.id),
                } });
        });
    }
}
exports.ApplicationService = ApplicationService;
