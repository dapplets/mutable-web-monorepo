import { ClonedContextNode } from '../../common/types'
import React, { FC } from 'react'

export const TreeTraverser: FC<{
  node: ClonedContextNode
  component: FC<{ node: ClonedContextNode }>
}> = ({ node, component: Component }) => {
  return (
    <>
      <Component node={node} />

      {node.children?.map((child) => (
        <TreeTraverser
          key={`${child.namespace}/${child.contextType}/${child.id}`}
          node={child}
          component={Component}
        />
      ))}
    </>
  )
}
