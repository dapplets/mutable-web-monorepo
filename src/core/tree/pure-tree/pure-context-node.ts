import { IContextNode } from '../types'

export class PureContextNode implements IContextNode {
  public id: string | null = null
  public tagName: string
  public namespace: string
  public parentNode: IContextNode | null = null
  public parsedContext: any = {}
  public children: IContextNode[] = []
  public insPoints: string[] = []

  constructor(namespace: string, tagName: string) {
    this.namespace = namespace
    this.tagName = tagName
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
