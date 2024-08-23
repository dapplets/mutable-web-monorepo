import { FC, useEffect, useReducer, useRef, useState } from 'react'
import { IContextNode, InsertionPointWithElement } from '@mweb/core'
import React from 'react'
import { useCore } from '../contexts/core-context'

// ToDo: move to React context to reuse semantic tree?

export const ContextTree: FC<{
  children: React.FC<{ context: IContextNode; insPoints: InsertionPointWithElement[] }>
}> = ({ children }) => {
  const { tree } = useCore()

  if (!tree) return null

  return <TreeItem node={tree} component={children} />
}

const TreeItem: FC<{
  node: IContextNode
  component: React.FC<{ context: IContextNode; insPoints: InsertionPointWithElement[] }>
}> = React.memo(({ node, component: Component }) => {
  // https://legacy.reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  const [insPoints, setInsPoints] = useState([...node.insPoints])

  useEffect(() => {
    // The Component re-renders when the current node changes only.
    // Changing the children and the parent node will not cause a re-render.
    // So it's not recommended to depend on another contexts in the Component.
    const subscriptions = [
      node.on('insertionPointAdded', ({ insertionPoint }) => {
        setInsPoints((prev) => [...prev, insertionPoint])
      }),
      node.on('insertionPointRemoved', ({ insertionPoint }) => {
        setInsPoints((prev) => prev.filter((ip) => ip !== insertionPoint))
      }),
      node.on('contextChanged', () => {
        forceUpdate()
      }),
      node.on('visibilityChanged', () => {
        forceUpdate()
      }),
    ]

    return () => {
      subscriptions.forEach((sub) => sub.remove())
    }
  }, [node])

  return (
    <>
      <Component context={node} insPoints={insPoints} />
      <TreeChildren node={node} component={Component} />
    </>
  )
})

/**
 * Splitting children to avoid re-rendering
 */
const TreeChildren: FC<{
  node: IContextNode
  component: React.FC<{ context: IContextNode; insPoints: InsertionPointWithElement[] }>
}> = ({ node, component: Component }) => {
  const [children, setChildren] = useState([...node.children])

  // ToDo: refactor it. It stores unique key for each context node
  const contextKeyRef = useRef(
    new WeakMap<IContextNode, number>(node.children.map((c, i) => [c, i]))
  )
  const contextKeyCounter = useRef(node.children.length - 1) // last index

  useEffect(() => {
    // The Component re-renders when the current node changes only.
    // Changing the children and the parent node will not cause a re-render.
    // So it's not recommended to depend on another contexts in the Component.
    const subscriptions = [
      node.on('childContextAdded', ({ child }) => {
        contextKeyRef.current.set(child, ++contextKeyCounter.current)
        setChildren((prev) => [...prev, child])
      }),
      node.on('childContextRemoved', ({ child }) => {
        setChildren((prev) => prev.filter((c) => c !== child))
      }),
    ]

    return () => {
      subscriptions.forEach((sub) => sub.remove())
    }
  }, [node])

  return (
    <>
      {children.map((child) => (
        <TreeItem
          // key={`${child.namespace}/${child.contextType}/${child.id}`}
          key={contextKeyRef.current.get(child)}
          node={child}
          component={Component}
        />
      ))}
    </>
  )
}
