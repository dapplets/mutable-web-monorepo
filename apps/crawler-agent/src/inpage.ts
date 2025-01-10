import { Core, IContextNode } from '@mweb/core'

const core = new Core()

export type ClonedContextNode = {
  namespace: string
  contextType: string
  id: string | null
  parsedContext: any
  children?: ClonedContextNode[]
  parentNode?: ClonedContextNode | null
}

function cloneContextSubtree(node: IContextNode): ClonedContextNode {
  const clonedParsedContext = { ...node.parsedContext }
  delete clonedParsedContext.id
  return {
    namespace: node.namespace,
    contextType: node.contextType,
    id: node.id,
    parsedContext: clonedParsedContext,
    parentNode: node.parentNode ? cloneContextSubtree(node.parentNode) : null,
  }
}

const handler = ({ child }: { child: IContextNode }) => {
  child.on('childContextAdded', handler)
  // @ts-ignore
  handleChildContextAdded(cloneContextSubtree(child))
}
core.tree.on('childContextAdded', handler)

// @ts-ignore
handleGetParserConfigs().then((configs: any[]) => {
  configs.forEach((config) => core.attachParserConfig(config))
})
