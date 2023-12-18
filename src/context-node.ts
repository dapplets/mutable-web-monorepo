export type ParsedContext = Record<
  string,
  string | number | boolean | null | undefined
>;

export class ContextNode {
  children: ContextNode[] = [];
  parent: ContextNode | null = null;
  type: string;
  props: ParsedContext = {}; // parsed props

  constructor(type: string) {
    this.type = type;
  }

  addChild(node: ContextNode) {
    node.parent = this;
    this.children.push(node);
  }

  removeChild(node: ContextNode) {
    this.children.splice(this.children.indexOf(node), 1);
  }
}
