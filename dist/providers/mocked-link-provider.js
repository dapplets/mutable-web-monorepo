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
exports.MockedLinkProvider = void 0;
const links = [
    {
        namespace: "https://dapplets.org/ns/json/dapplets.near/parser/near-social-viewer",
        contextType: "post",
        contextId: "root.near/108491730",
        insertionPoint: "like",
        insertionType: "after",
        component: "dapplets.near/widget/Dog",
    },
    {
        namespace: "https://dapplets.org/ns/json/dapplets.near/parser/near-social-viewer",
        contextType: "post",
        contextId: "mum001.near/108508979",
        insertionPoint: "like",
        insertionType: "after",
        component: "dapplets.near/widget/Cat",
    },
    {
        namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
        contextType: "post",
        contextId: "1694995303642939408",
        insertionPoint: "southPanel",
        insertionType: "after",
        component: "dapplets.near/widget/Cat",
    },
    {
        namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
        contextType: "post",
        contextId: "1694995241055465828",
        insertionPoint: "southPanel",
        insertionType: "after",
        component: "dapplets.near/widget/Dog",
    },
    {
        namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
        contextType: "post",
        contextId: null,
        insertionPoint: "root",
        insertionType: "inside",
        component: "lisofffa.near/widget/Mutation-Overlay",
    },
    {
        namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
        contextType: "post",
        contextId: null,
        insertionPoint: "southPanel",
        insertionType: "after",
        component: "nikter.near/widget/Tipping",
    },
];
class MockedLinkProvider {
    getLinksForContext(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // ignore contexts without id
            if (!context.id)
                return [];
            // ToDo: match namespace
            // Add links that match the context name
            const output = links.filter((link) => link.contextType === context.tagName && !link.contextId);
            // Add links that match the context id
            if (context.id) {
                output.push(...links.filter((link) => link.contextType === context.tagName &&
                    link.contextId === context.id));
            }
            return output;
        });
    }
    createLink(link) {
        return __awaiter(this, void 0, void 0, function* () {
            links.push(link);
        });
    }
}
exports.MockedLinkProvider = MockedLinkProvider;
