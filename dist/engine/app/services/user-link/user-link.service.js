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
exports.UserLinkSerivce = void 0;
const target_service_1 = require("../target/target.service");
class UserLinkSerivce {
    constructor(userLinkRepository, applicationService) {
        this.userLinkRepository = userLinkRepository;
        this.applicationService = applicationService;
    }
    // ToDo: replace with getAppsAndLinksForContext
    getLinksForContext(appsToCheck, mutationId, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            for (const app of appsToCheck) {
                const suitableTargets = app.targets.filter((target) => target_service_1.TargetService.isTargetMet(target, context));
                // ToDo: batch requests
                suitableTargets.forEach((target) => {
                    promises.push(this._getUserLinksForTarget(mutationId, app.id, target, context));
                });
            }
            const appLinksNested = yield Promise.all(promises);
            return appLinksNested.flat(2);
        });
    }
    createLink(mutationId, appGlobalId, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const app = yield this.applicationService.getApplication(appGlobalId);
            if (!app) {
                throw new Error('App not found');
            }
            const suitableTargets = app.targets.filter((target) => target_service_1.TargetService.isTargetMet(target, context));
            if (suitableTargets.length === 0) {
                throw new Error('No suitable targets found');
            }
            if (suitableTargets.length > 1) {
                throw new Error('More than one suitable targets found');
            }
            const [target] = suitableTargets;
            const indexObject = UserLinkSerivce._buildLinkIndex(app.id, mutationId, target, context);
            // ToDo: this limitation on the frontend side only
            if (target.injectOnce) {
                const existingLinks = yield this.userLinkRepository.getLinksByIndex(indexObject);
                if (existingLinks.length > 0) {
                    throw new Error(`The widget is injected already. The "injectOnce" parameter limits multiple insertion of widgets`);
                }
            }
            const indexedLink = yield this.userLinkRepository.createLink(indexObject);
            return {
                id: indexedLink.id,
                appId: appGlobalId,
                namespace: target.namespace,
                authorId: indexedLink.authorId,
                bosWidgetId: target.componentId,
                insertionPoint: target.injectTo,
            };
        });
    }
    deleteUserLink(userLinkId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userLinkRepository.deleteUserLink(userLinkId);
        });
    }
    // #endregion
    // #region Private
    _getUserLinksForTarget(mutationId, appId, target, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const indexObject = UserLinkSerivce._buildLinkIndex(appId, mutationId, target, context);
            const indexedLinks = yield this.userLinkRepository.getLinksByIndex(indexObject);
            return indexedLinks.map((link) => ({
                id: link.id,
                appId: appId,
                authorId: link.authorId,
                namespace: target.namespace,
                bosWidgetId: target.componentId, // ToDo: unify
                insertionPoint: target.injectTo, // ToDo: unify
            }));
        });
    }
    // #region Utils
    static _buildLinkIndex(appId, mutationId, target, context) {
        const indexedContextData = this._buildIndexedContextValues(target.if, context.parsedContext);
        return {
            appId,
            mutationId,
            namespace: target.namespace,
            contextType: target.contextType,
            if: indexedContextData,
        };
    }
    static _buildIndexedContextValues(conditions, values) {
        const object = {};
        for (const property in conditions) {
            if (conditions[property].index) {
                object[property] = values[property];
            }
        }
        return object;
    }
}
exports.UserLinkSerivce = UserLinkSerivce;
