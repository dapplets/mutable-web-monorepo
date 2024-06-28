"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
const react_1 = __importStar(require("react"));
const react_2 = require("../../../react");
const engine_context_1 = require("../contexts/engine-context");
const use_user_links_1 = require("../contexts/mutable-web-context/use-user-links");
const near_social_vm_1 = require("near-social-vm");
const use_portal_filter_1 = require("../contexts/engine-context/use-portal-filter");
const shadow_dom_wrapper_1 = require("../components/shadow-dom-wrapper");
const context_tree_1 = require("../../../react/components/context-tree");
const use_context_apps_1 = require("../contexts/mutable-web-context/use-context-apps");
const transferable_context_1 = require("../common/transferable-context");
const modal_context_1 = require("../contexts/modal-context");
const ContextManager = () => {
    return react_1.default.createElement(context_tree_1.ContextTree, { children: ContextHandler });
};
exports.ContextManager = ContextManager;
const ContextHandler = ({ context, insPoints, }) => {
    const { userLinks, createUserLink, deleteUserLink } = (0, use_user_links_1.useUserLinks)(context);
    const { apps } = (0, use_context_apps_1.useContextApps)(context);
    const [isEditMode, setIsEditMode] = (0, react_1.useState)(false);
    const transferableContext = (0, react_1.useMemo)(() => (0, transferable_context_1.buildTransferableContext)(context), [context]);
    // For OverlayTrigger
    const attachContextRef = (0, react_1.useCallback)((callback) => {
        callback(context.element);
    }, [context]);
    const handleEnableEditMode = (0, react_1.useCallback)(() => {
        setIsEditMode(true);
    }, [setIsEditMode]);
    const handleDisableEditMode = (0, react_1.useCallback)(() => {
        setIsEditMode(false);
    }, [setIsEditMode]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        insPoints.map((ip) => (react_1.default.createElement(react_2.ContextPortal, { key: ip.name, context: context, injectTo: ip.name },
            react_1.default.createElement(InsPointHandler, { insPointName: ip.name, bosLayoutManager: ip.bosLayoutManager, context: context, transferableContext: transferableContext, allUserLinks: userLinks, apps: apps, isEditMode: isEditMode, onCreateUserLink: createUserLink, onDeleteUserLink: deleteUserLink, onEnableEditMode: handleEnableEditMode, onDisableEditMode: handleDisableEditMode, onAttachContextRef: attachContextRef })))),
        react_1.default.createElement(react_2.ContextPortal, { context: context },
            react_1.default.createElement(InsPointHandler, { context: context, transferableContext: transferableContext, allUserLinks: userLinks, apps: apps, isEditMode: isEditMode, onCreateUserLink: createUserLink, onDeleteUserLink: deleteUserLink, onEnableEditMode: handleEnableEditMode, onDisableEditMode: handleDisableEditMode, onAttachContextRef: attachContextRef }))));
};
const InsPointHandler = ({ insPointName, bosLayoutManager, context, transferableContext, allUserLinks, apps, isEditMode, onCreateUserLink, onDeleteUserLink, onEnableEditMode, onDisableEditMode, onAttachContextRef, }) => {
    const { redirectMap } = (0, engine_context_1.useEngine)();
    const { components } = (0, use_portal_filter_1.usePortalFilter)(context, insPointName); // ToDo: extract to the separate AppManager component
    const { notify } = (0, modal_context_1.useModal)();
    const attachInsPointRef = (0, react_1.useCallback)((callback) => {
        var _a;
        // ToDo: the similar logic is used in ContextPortal
        const targetElement = insPointName
            ? (_a = context.insPoints.find((ip) => ip.name === insPointName)) === null || _a === void 0 ? void 0 : _a.element
            : context.element;
        callback(targetElement);
    }, [context, insPointName]);
    const defaultLayoutManager = 'bos.dapplets.near/widget/DefaultLayoutManager';
    const props = {
        // ToDo: unify context forwarding
        context: transferableContext,
        apps: apps.map((app) => ({
            id: app.id,
            metadata: app.metadata,
        })),
        widgets: allUserLinks.map((link) => ({
            linkId: link.id,
            linkAuthorId: link.authorId,
            src: link.bosWidgetId,
            props: {
                context: transferableContext,
                link: {
                    id: link.id,
                    authorId: link.authorId,
                },
                notify,
            }, // ToDo: add props
            isSuitable: link.insertionPoint === insPointName, // ToDo: LM know about widgets from other LM
        })),
        components: components,
        isEditMode: isEditMode,
        // ToDo: move functions to separate api namespace?
        createUserLink: onCreateUserLink,
        deleteUserLink: onDeleteUserLink,
        enableEditMode: onEnableEditMode,
        disableEditMode: onDisableEditMode,
        // For OverlayTrigger
        attachContextRef: onAttachContextRef,
        attachInsPointRef,
        notify,
    };
    // Don't render layout manager if there are no components
    // It improves performance
    if (components.length === 0 &&
        !allUserLinks.some((link) => link.insertionPoint === insPointName) &&
        bosLayoutManager !== 'bos.dapplets.near/widget/ContextActionsGroup' // ToDo: hardcode
    ) {
        return null;
    }
    return (react_1.default.createElement(shadow_dom_wrapper_1.ShadowDomWrapper, { className: "mweb-layout-manager" },
        react_1.default.createElement(near_social_vm_1.Widget, { src: bosLayoutManager !== null && bosLayoutManager !== void 0 ? bosLayoutManager : defaultLayoutManager, props: props, loading: react_1.default.createElement(react_1.default.Fragment, null), config: { redirectMap } })));
};
