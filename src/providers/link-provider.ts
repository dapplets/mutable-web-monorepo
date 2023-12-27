import { Context } from "../core/types";

export type BosUserLink = {
  id: string;
  parserConfigId: string;
  expression: string;
  insertionPoint: string;
  insertionType: string;
  component: string;
  // ToDo: add props
};

const links = [
  {
    id: "1",
    parserConfigId: "dapplets.near/parser/near-social-viewer",
    expression: 'post[id="root.near/108491730"]',
    insertionPoint: "like",
    insertionType: "after",
    component: "dapplets.near/widget/Dog",
  },
  {
    id: "2",
    parserConfigId: "dapplets.near/parser/near-social-viewer",
    expression: 'post[id="mum001.near/108508979"]',
    insertionPoint: "like",
    insertionType: "after",
    component: "dapplets.near/widget/Cat",
  },
  {
    id: "3",
    parserConfigId: "dapplets.near/parser/twitter",
    expression: 'post[id="1694995303642939408"]',
    insertionPoint: "southPanel",
    insertionType: "after",
    component: "dapplets.near/widget/Cat",
  },
  {
    id: "4",
    parserConfigId: "dapplets.near/parser/twitter",
    expression: 'post[id="1694995241055465828"]',
    insertionPoint: "southPanel",
    insertionType: "after",
    component: "dapplets.near/widget/Dog",
  },
  {
    id: "5",
    parserConfigId: "dapplets.near/parser/twitter",
    expression: 'post',
    insertionPoint: "root",
    insertionType: "inside",
    component: "lisofffa.near/widget/Mutation-Overlay",
  },
  {
    id: "6",
    parserConfigId: "dapplets.near/parser/twitter",
    expression: 'post',
    insertionPoint: "southPanel",
    insertionType: "after",
    component: "nikter.near/widget/Tipping",
  }
];

export class LinkProvider {
  async getLinksForContext(context: Context): Promise<BosUserLink[]> {
    // ignore contexts without id
    if (!context.id) return [];

    // Add links that match the context name
    const output = links.filter((link) => link.expression === context.tagName);

    // Add links that match the context id
    if (context.id) {
      const expression = `${context.tagName}[id="${context.id}"]`;
      output.push(...links.filter((link) => link.expression === expression));
    }
    
    return output;
  }
}
