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
var _ContextManager_adapter, _ContextManager_widgetFactory, _ContextManager_layoutManagers, _ContextManager_mutationManager, _ContextManager_userLinks, _ContextManager_apps;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
const layout_manager_1 = require("./layout-manager");
const DefaultLayoutManager = "bos.dapplets.near/widget/DefaultLayoutManager";
class ContextManager {
    constructor(context, adapter, widgetFactory, mutationManager) {
        _ContextManager_adapter.set(this, void 0);
        _ContextManager_widgetFactory.set(this, void 0);
        _ContextManager_layoutManagers.set(this, new Map());
        _ContextManager_mutationManager.set(this, void 0);
        _ContextManager_userLinks.set(this, new Map());
        _ContextManager_apps.set(this, new Map());
        this.context = context;
        __classPrivateFieldSet(this, _ContextManager_adapter, adapter, "f");
        __classPrivateFieldSet(this, _ContextManager_widgetFactory, widgetFactory, "f");
        __classPrivateFieldSet(this, _ContextManager_mutationManager, mutationManager, "f");
    }
    forceUpdate() {
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((layoutManager) => {
            layoutManager.forceUpdate();
        });
    }
    enableEditMode() {
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((layoutManager) => {
            layoutManager.enableEditMode();
        });
    }
    disableEditMode() {
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((layoutManager) => {
            layoutManager.disableEditMode();
        });
    }
    addUserLink(link) {
        var _a;
        __classPrivateFieldGet(this, _ContextManager_userLinks, "f").set(link.id, link); // save link for further layout managers
        (_a = __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").get(link.insertionPoint)) === null || _a === void 0 ? void 0 : _a.addUserLink(link);
    }
    removeUserLink(link) {
        var _a;
        __classPrivateFieldGet(this, _ContextManager_userLinks, "f").delete(link.id);
        (_a = __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").get(link.insertionPoint)) === null || _a === void 0 ? void 0 : _a.removeUserLink(link.id);
    }
    addAppMetadata(appMetadata) {
        // ToDo: use getAppsAndLinksForContext to filter `injectOnce` targets
        __classPrivateFieldGet(this, _ContextManager_apps, "f").set(appMetadata.id, appMetadata); // save app for further layout managers
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((lm) => lm.addAppMetadata(appMetadata));
    }
    removeAppMetadata(app) {
        __classPrivateFieldGet(this, _ContextManager_apps, "f").delete(app.id);
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((lm) => lm.removeAppMetadata(app.id));
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
    injectLayoutManager(insPointName) {
        var _a;
        const insertionPoints = __classPrivateFieldGet(this, _ContextManager_adapter, "f").getInsertionPoints(this.context);
        const insPoint = insertionPoints.find((ip) => ip.name === insPointName);
        if (!insPoint) {
            return;
        }
        const bosWidgetId = (_a = insPoint.bosLayoutManager) !== null && _a !== void 0 ? _a : DefaultLayoutManager;
        const layoutManagerElement = __classPrivateFieldGet(this, _ContextManager_widgetFactory, "f").createWidget(bosWidgetId);
        const layoutManager = new layout_manager_1.LayoutManager(layoutManagerElement, this);
        try {
            // Inject layout manager
            __classPrivateFieldGet(this, _ContextManager_adapter, "f").injectElement(layoutManagerElement, this.context, insPoint.name);
            __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").set(insPoint.name, layoutManager);
            const suitableLinks = Array.from(__classPrivateFieldGet(this, _ContextManager_userLinks, "f").values()).filter((link) => link.insertionPoint === insPoint.name);
            // Add existing links to layout managers injected later (for lazy loading websites)
            suitableLinks.forEach((link) => layoutManager.addUserLink(link));
            // Add existing apps to the layout manager
            __classPrivateFieldGet(this, _ContextManager_apps, "f").forEach((app) => layoutManager.addAppMetadata(app));
        }
        catch (err) {
            console.error(err);
        }
    }
    destroy() {
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").forEach((lm) => lm.destroy());
        __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").clear();
    }
}
exports.ContextManager = ContextManager;
_ContextManager_adapter = new WeakMap(), _ContextManager_widgetFactory = new WeakMap(), _ContextManager_layoutManagers = new WeakMap(), _ContextManager_mutationManager = new WeakMap(), _ContextManager_userLinks = new WeakMap(), _ContextManager_apps = new WeakMap();
