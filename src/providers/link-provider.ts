import { Context } from "../core/types";

export type BosUserLink = {
  id: string;
  parserConfigId: string;
  expr: string;
  insertionPoint: string;
  insertionType: string;
  component: string;
  // ToDo: add props
};

const links = [
  {
    id: "1",
    parserConfigId: "dapplets.near/parser/near-social-viewer",
    expr: 'post[id="root.near/108491730"]',
    insertionPoint: "like",
    insertionType: "after",
    component: "dapplets.near/widget/Dog",
  },
  {
    id: "2",
    parserConfigId: "dapplets.near/parser/near-social-viewer",
    expr: 'post[id="mum001.near/108508979"]',
    insertionPoint: "like",
    insertionType: "after",
    component: "dapplets.near/widget/Cat",
  },
  {
    id: "3",
    parserConfigId: "dapplets.near/parser/twitter",
    expr: 'post[id="1694995303642939408"]',
    insertionPoint: "southPanel",
    insertionType: "after",
    component: "dapplets.near/widget/Cat",
  },
  {
    id: "4",
    parserConfigId: "dapplets.near/parser/twitter",
    expr: 'post[id="1694995241055465828"]',
    insertionPoint: "southPanel",
    insertionType: "after",
    component: "dapplets.near/widget/Dog",
  },
];

export class LinkProvider {
  async getLinksForContext(context: Context): Promise<BosUserLink[]> {
    if (!context.id) return []; // ignore contexts without id
    const expression = `${context.tagName}[id="${context.id}"]`;
    return links.filter((link) => link.expr === expression);
  }
}
