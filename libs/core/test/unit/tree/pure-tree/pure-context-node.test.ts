import { PureContextNode } from '../../../../../src/core/tree/pure-tree/pure-context-node'
import { describe, expect, it } from '@jest/globals'

const NS = 'engine'

describe('PureContextNode', () => {
  it('initializes properties', () => {
    // Arrange
    const contextType = 'root'

    // Act
    const node = new PureContextNode(NS, contextType)

    // Assert
    expect(node.children.length).toBe(0)
    expect(node.parentNode).toBe(null)
    expect(node.id).toBe(null)
    expect(node.insPoints.length).toBe(0)
    expect(node.namespace).toBe(NS)
    expect(node.contextType).toBe(contextType)
  })

  it('context node append child', () => {
    // Arrange
    const parent = new PureContextNode(NS, 'parent')
    const child = new PureContextNode(NS, 'child')

    // Act
    parent.appendChild(child)

    // Assert
    expect(child.parentNode).toBe(parent)
    expect(parent.children).toContain(child)
  })

  it('context node remove child', () => {
    // Arrange
    const parent = new PureContextNode(NS, 'parent')
    const child = new PureContextNode(NS, 'child')
    parent.appendChild(child)

    // Act
    parent.removeChild(child)

    // Assert
    expect(child.parentNode).toBe(null)
    expect(parent.children).not.toContain(child)
  })
})
