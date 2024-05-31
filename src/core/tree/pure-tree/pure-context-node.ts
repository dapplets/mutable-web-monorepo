import { IContextNode } from '../types'

export class PureContextNode implements IContextNode {
  public id: string | null = null
  public contextType: string
  public namespace: string
  public parentNode: IContextNode | null = null
  public parsedContext: any = {}
  public children: IContextNode[] = []
  public insPoints: string[] = []
  public element: HTMLElement | null = null;

  constructor(
    namespace: string,
    contextType: string,
    parsedContext: any = {},
    insPoints: string[] = [],
    element: HTMLElement | null = null
  ) {
    this.namespace = namespace
    this.contextType = contextType
    this.parsedContext = parsedContext
    this.insPoints = insPoints
    this.element = element

    // ToDo: the similar logic is in tree builder
    this.id = parsedContext.id ?? null
  }

  removeChild(child: IContextNode): void {
    child.parentNode = null
    this.children = this.children.filter((c) => c !== child)
  }

  appendChild(child: IContextNode): void {
    child.parentNode = this
    this.children.push(child)
  }
}
