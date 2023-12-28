import { Context } from "../core/types";
import { BosUserLink, ILinkProvider } from "./link-provider";

const links: BosUserLink[] = [
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

export class MockedLinkProvider implements ILinkProvider {
  async getLinksForContext(context: Context): Promise<BosUserLink[]> {
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

  async createLink(link: BosUserLink): Promise<void> {
    links.push(link);
  }
}
