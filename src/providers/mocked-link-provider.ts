import { IContextNode } from "../core/tree/types";
import { generateGuid } from "../core/utils";
import { BosUserLink, ILinkProvider } from "./link-provider";

const links: BosUserLink[] = [
  {
    id: "1",
    namespace:
      "https://dapplets.org/ns/json/dapplets.near/parser/near-social-viewer",
    contextType: "post",
    contextId: "root.near/108491730",
    insertionPoint: "like",
    component: "bos.dapplets.near/widget/Dog",
  },
  {
    id: "2",
    namespace:
      "https://dapplets.org/ns/json/dapplets.near/parser/near-social-viewer",
    contextType: "post",
    contextId: "mum001.near/108508979",
    insertionPoint: "like",
    component: "bos.dapplets.near/widget/Cat",
  },
  {
    id: "3",
    namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
    contextType: "post",
    contextId: "1694995303642939408",
    insertionPoint: "southPanel",
    component: "bos.dapplets.near/widget/Cat",
  },
  {
    id: "4",
    namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
    contextType: "post",
    contextId: "1694995241055465828",
    insertionPoint: "southPanel",
    component: "bos.dapplets.near/widget/Dog",
  },
  {
    id: "5",
    namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
    contextType: "post",
    contextId: null,
    insertionPoint: "root",
    component: "lisofffa.near/widget/Mutation-Overlay",
  },
  {
    id: "6",
    namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
    contextType: "post",
    contextId: null,
    insertionPoint: "southPanel",
    component: "nikter.near/widget/Tipping",
  },
];

export class MockedLinkProvider implements ILinkProvider {
  async getLinksForContext(context: IContextNode): Promise<BosUserLink[]> {
    // ignore contexts without id
    if (!context.id) return [];

    // ToDo: match namespace

    // Add links that match the context name
    const output = links.filter(
      (link) => link.contextType === context.tagName && !link.contextId
    );

    // Add links that match the context id
    if (context.id) {
      output.push(
        ...links.filter(
          (link) =>
            link.contextType === context.tagName &&
            link.contextId === context.id
        )
      );
    }

    return output;
  }

  async createLink(link: Omit<BosUserLink, "id">): Promise<BosUserLink> {
    const linkId = generateGuid();
    const newLink: BosUserLink = { id: linkId, ...link };
    links.push(newLink);
    return newLink;
  }
}
