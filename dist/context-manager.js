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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ContextManager_adapter, _ContextManager_widgetFactory, _ContextManager_layoutManagers, _ContextManager_mutationManager, _ContextManager_userLinks, _ContextManager_apps, _ContextManager_defaultLayoutManager, _ContextManager_redirectMap, _ContextManager_refComponents;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
const layout_manager_1 = require("./layout-manager");
class ContextManager {
    constructor(context, adapter, widgetFactory, mutationManager, defaultLayoutManager) {
        _ContextManager_adapter.set(this, void 0);
        _ContextManager_widgetFactory.set(this, void 0);
        _ContextManager_layoutManagers.set(this, new Map());
        _ContextManager_mutationManager.set(this, void 0);
        _ContextManager_userLinks.set(this, new Map());
        _ContextManager_apps.set(this, new Map());
        _ContextManager_defaultLayoutManager.set(this, void 0);
        _ContextManager_redirectMap.set(this, null
        // ToDo: duplcated in ContextManager and LayoutManager
        );
        // ToDo: duplcated in ContextManager and LayoutManager
        _ContextManager_refComponents.set(this, new Map());
        this.context = context;
        __classPrivateFieldSet(this, _ContextManager_adapter, adapter, "f");
        __classPrivateFieldSet(this, _ContextManager_widgetFactory, widgetFactory, "f");
        __classPrivateFieldSet(this, _ContextManager_mutationManager, mutationManager, "f");
        __classPrivateFieldSet(this, _ContextManager_defaultLayoutManager, defaultLayoutManager, "f");
    }
    forceUpdate() {
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((lm) => lm.forceUpdate());
    }
    enableEditMode() {
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((lm) => lm.enableEditMode());
    }
    disableEditMode() {
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((lm) => lm.disableEditMode());
    }
    addUserLink(link) {
        __classPrivateFieldGet(this, _ContextManager_userLinks, "f").set(link.id, link); // save link for further layout managers
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((lm, lmInsPoint) => {
            lm.addUserLink(link, link.insertionPoint === lmInsPoint);
        });
    }
    removeUserLink(link) {
        __classPrivateFieldGet(this, _ContextManager_userLinks, "f").delete(link.id);
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((lm) => lm.removeUserLink(link.id));
    }
    addAppMetadata(appMetadata) {
        const injectableTargets = appMetadata.targets.filter((target) => this._isTargetInjectable(target, appMetadata.id));
        // Exclude apps that already injected (for `injectOnce` targets)
        if (injectableTargets.length === 0) {
            return;
        }
        const metadataWithSuitableTargets = Object.assign(Object.assign({}, appMetadata), { targets: injectableTargets });
        __classPrivateFieldGet(this, _ContextManager_apps, "f").set(appMetadata.id, metadataWithSuitableTargets); // save app for further layout managers
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((lm) => lm.addAppMetadata(metadataWithSuitableTargets));
    }
    removeAppMetadata(appGlobalId) {
        __classPrivateFieldGet(this, _ContextManager_apps, "f").delete(appGlobalId);
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((lm) => lm.removeAppMetadata(appGlobalId));
    }
    createUserLink(globalAppId) {
        return __awaiter(this, void 0, void 0, function* () {
            const createdLink = yield __classPrivateFieldGet(this, _ContextManager_mutationManager, "f").createLink(globalAppId, this.context);
            this.addUserLink(createdLink);
        });
    }
    deleteUserLink(userLink) {
        return __awaiter(this, void 0, void 0, function* () {
            yield __classPrivateFieldGet(this, _ContextManager_mutationManager, "f").deleteUserLink(userLink.id);
            this.removeUserLink(userLink);
        });
    }
    setRedirectMap(redirectMap) {
        __classPrivateFieldSet(this, _ContextManager_redirectMap, redirectMap, "f");
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((lm) => lm.setRedirectMap(redirectMap));
    }
    injectLayoutManager(insPointName) {
        var _a;
        const insertionPoints = __classPrivateFieldGet(this, _ContextManager_adapter, "f").getInsertionPoints(this.context);
        const insPoint = insertionPoints.find((ip) => ip.name === insPointName);
        if (!insPoint) {
            return;
        }
        const bosWidgetId = (_a = insPoint.bosLayoutManager) !== null && _a !== void 0 ? _a : __classPrivateFieldGet(this, _ContextManager_defaultLayoutManager, "f");
        const layoutManagerElement = __classPrivateFieldGet(this, _ContextManager_widgetFactory, "f").createWidget(bosWidgetId);
        const contextElement = __classPrivateFieldGet(this, _ContextManager_adapter, "f").getContextElement(this.context);
        const insPointElement = __classPrivateFieldGet(this, _ContextManager_adapter, "f").getInsertionPointElement(this.context, insPointName);
        if (!contextElement) {
            throw new Error('No context element found');
        }
        if (!insPointElement) {
            throw new Error('No insertion point element found');
        }
        const layoutManager = new layout_manager_1.LayoutManager(layoutManagerElement, contextElement, insPointElement, this);
        try {
            // Inject layout manager
            __classPrivateFieldGet(this, _ContextManager_adapter, "f").injectElement(layoutManagerElement, this.context, insPoint.name);
            __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").set(insPoint.name, layoutManager);
            // Add existing links to layout managers injected later (for lazy loading websites)
            Array.from(__classPrivateFieldGet(this, _ContextManager_userLinks, "f").values()).forEach((link) => layoutManager.addUserLink(link, link.insertionPoint === insPoint.name));
            // Add existing apps to the layout manager
            __classPrivateFieldGet(this, _ContextManager_apps, "f").forEach((app) => layoutManager.addAppMetadata(app));
            layoutManager.setRedirectMap(__classPrivateFieldGet(this, _ContextManager_redirectMap, "f"));
            // Add existing React component refereneces from portals
            __classPrivateFieldGet(this, _ContextManager_refComponents, "f").forEach((target, cmp) => {
                if (target.injectTo === insPoint.name) {
                    layoutManager.injectComponent(target, cmp);
                }
            });
        }
        catch (err) {
            console.error(err);
        }
    }
    destroyLayoutManager(insPointName) {
        var _a;
        (_a = __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").get(insPointName)) === null || _a === void 0 ? void 0 : _a.destroy();
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").delete(insPointName);
    }
    destroy() {
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((lm) => lm.destroy());
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").clear();
        __classPrivateFieldGet(this, _ContextManager_refComponents, "f").clear();
    }
    injectComponent(target, cmp) {
        var _a;
        // save refs for future contexts
        __classPrivateFieldGet(this, _ContextManager_refComponents, "f").set(cmp, target);
        (_a = __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").get(target.injectTo)) === null || _a === void 0 ? void 0 : _a.injectComponent(target, cmp);
    }
    unjectComponent(target, cmp) {
        var _a;
        __classPrivateFieldGet(this, _ContextManager_refComponents, "f").delete(cmp);
        (_a = __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").get(target.injectTo)) === null || _a === void 0 ? void 0 : _a.unjectComponent(target, cmp);
    }
    _isTargetInjectable(target, appId) {
        // The limitation is only for `injectOnce` targets
        if (!target.injectOnce)
            return true;
        // ToDo: looks that target should have an unique identifier?
        const userLinks = Array.from(__classPrivateFieldGet(this, _ContextManager_userLinks, "f").values());
        const isInjected = !!userLinks.find((link) => link.appId === appId &&
            link.namespace === target.namespace &&
            link.insertionPoint === target.injectTo &&
            link.bosWidgetId === target.componentId);
        return !isInjected;
    }
}
exports.ContextManager = ContextManager;
_ContextManager_adapter = new WeakMap(), _ContextManager_widgetFactory = new WeakMap(), _ContextManager_layoutManagers = new WeakMap(), _ContextManager_mutationManager = new WeakMap(), _ContextManager_userLinks = new WeakMap(), _ContextManager_apps = new WeakMap(), _ContextManager_defaultLayoutManager = new WeakMap(), _ContextManager_redirectMap = new WeakMap(), _ContextManager_refComponents = new WeakMap();
