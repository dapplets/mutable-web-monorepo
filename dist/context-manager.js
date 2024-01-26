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
var _ContextManager_adapter, _ContextManager_widgetFactory, _ContextManager_layoutManagers, _ContextManager_provider, _ContextManager_userLinks;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
const interface_1 = require("./core/adapters/interface");
const layout_manager_1 = require("./layout-manager");
const DefaultLayoutManager = "bos.dapplets.near/widget/DefaultLayoutManager";
const DefaultInsertionType = interface_1.InsertionType.Before;
class ContextManager {
    constructor(context, adapter, widgetFactory, provider) {
        _ContextManager_adapter.set(this, void 0);
        _ContextManager_widgetFactory.set(this, void 0);
        _ContextManager_layoutManagers.set(this, new Map());
        _ContextManager_provider.set(this, void 0);
        _ContextManager_userLinks.set(this, new Map());
        this.context = context;
        __classPrivateFieldSet(this, _ContextManager_adapter, adapter, "f");
        __classPrivateFieldSet(this, _ContextManager_widgetFactory, widgetFactory, "f");
        __classPrivateFieldSet(this, _ContextManager_provider, provider, "f");
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
        // Check if link is suitable for this context
        if (link.contextType && link.contextType !== this.context.tagName)
            return;
        if (link.contextId && link.contextId !== this.context.id)
            return;
        __classPrivateFieldGet(this, _ContextManager_userLinks, "f").set(link.id, link); // save link for further layout managers
        (_a = __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").get(link.insertionPoint)) === null || _a === void 0 ? void 0 : _a.addUserLink(link);
    }
    removeUserLink(link) {
        var _a;
        __classPrivateFieldGet(this, _ContextManager_userLinks, "f").delete(link.id);
        (_a = __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").get(link.insertionPoint)) === null || _a === void 0 ? void 0 : _a.removeUserLink(link.id);
    }
    createUserLink(bosWidgetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = this.context;
            const templates = yield __classPrivateFieldGet(this, _ContextManager_provider, "f").getLinkTemplates(bosWidgetId);
            const suitableTemplates = templates.filter((template) => {
                if (template.contextType !== context.tagName)
                    return false;
                // ToDo: get rid of magic values
                // context id required
                if (template.contextId === "" && !context.id)
                    return false;
                // template for specific context
                if (template.contextId !== undefined &&
                    template.contextId !== null &&
                    template.contextId !== "" &&
                    context.id !== template.contextId) {
                    return false;
                }
                return true;
            });
            if (suitableTemplates.length === 0) {
                // ToDo: suggest user to select insertion point manually
                throw new Error("No link templates found");
            }
            // ToDo: suggest user to select insertion point manually
            const template = suitableTemplates[0];
            const createdLink = yield __classPrivateFieldGet(this, _ContextManager_provider, "f").createLink({
                namespace: context.namespaceURI,
                contextType: context.tagName,
                contextId: template.contextId === null || template.contextId === undefined
                    ? null
                    : context.id, // ToDo: get rid of magic values
                insertionPoint: template.insertionPoint,
                bosWidgetId: bosWidgetId,
            });
            this.addUserLink(createdLink);
        });
    }
    deleteUserLink(userLink) {
        return __awaiter(this, void 0, void 0, function* () {
            yield __classPrivateFieldGet(this, _ContextManager_provider, "f").deleteUserLink({
                id: userLink.id,
                bosWidgetId: userLink.bosWidgetId,
            });
            this.removeUserLink(userLink);
        });
    }
    injectLayoutManager(insPointName) {
        var _a, _b;
        const insertionPoints = __classPrivateFieldGet(this, _ContextManager_adapter, "f").getInsertionPoints(this.context);
        const insPoint = insertionPoints.find((ip) => ip.name === insPointName);
        if (!insPoint) {
            return;
        }
        const bosWidgetId = (_a = insPoint.bosLayoutManager) !== null && _a !== void 0 ? _a : DefaultLayoutManager;
        const insertionType = (_b = insPoint.insertionType) !== null && _b !== void 0 ? _b : DefaultInsertionType;
        const layoutManagerElement = __classPrivateFieldGet(this, _ContextManager_widgetFactory, "f").createWidget(bosWidgetId);
        const layoutManager = new layout_manager_1.LayoutManager(layoutManagerElement, this);
        try {
            // Inject layout manager
            __classPrivateFieldGet(this, _ContextManager_adapter, "f").injectElement(layoutManagerElement, this.context, insPoint.name, insertionType);
            __classPrivateFieldGet(this, _ContextManager_layoutManagers, "f").set(insPoint.name, layoutManager);
            const suitableLinks = Array.from(__classPrivateFieldGet(this, _ContextManager_userLinks, "f").values()).filter((link) => link.insertionPoint === insPoint.name);
            // Add existing links to layout managers injected later (for lazy loading websites)
            suitableLinks.forEach((link) => layoutManager.addUserLink(link));
        }
        catch (err) {
            console.error(err);
        }
    }
}
exports.ContextManager = ContextManager;
_ContextManager_adapter = new WeakMap(), _ContextManager_widgetFactory = new WeakMap(), _ContextManager_layoutManagers = new WeakMap(), _ContextManager_provider = new WeakMap(), _ContextManager_userLinks = new WeakMap();
