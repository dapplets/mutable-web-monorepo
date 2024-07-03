import { describe, expect, it, beforeEach, jest, afterEach } from '@jest/globals'

import { IContextListener, ITreeBuilder } from '../../../../../src/core/tree/types'
import { PureTreeBuilder } from '../../../../../src/core/tree/pure-tree/pure-tree-builder'
import { PureContextNode } from '../../../../../src/core/tree/pure-tree/pure-context-node'

const NS = 'engine'

// automock dependency
jest.mock('../../../../../src/core/tree/pure-tree/pure-context-node')

describe('Pure tree builder', () => {
  let treeBuilder: ITreeBuilder
  let mockListeners: IContextListener

  beforeEach(() => {
    // mock dependency manually
    mockListeners = {
      handleContextStarted: jest.fn(),
      handleContextChanged: jest.fn(),
      handleContextFinished: jest.fn(),
      handleInsPointStarted: jest.fn(),
      handleInsPointFinished: jest.fn(),
    }

    treeBuilder = new PureTreeBuilder(mockListeners)
  })

  it('initializes correctly', () => {
    // Assert
    expect(PureContextNode).toBeCalledTimes(1) // root node created
    expect(treeBuilder.root).not.toBe(null)
  })

  it('create node', () => {
    // Arrange
    const mockContextNodeClass = PureContextNode as jest.Mock
    jest.clearAllMocks() // reset calling times

    // Act
    const node = treeBuilder.createNode(NS, 'root')

    // Assert
    expect(PureContextNode).toBeCalledTimes(1)
    expect(node).toBe(mockContextNodeClass.mock.instances[0])
  })

  it('append child', () => {
    // Arrange
    const parent = treeBuilder.createNode(NS, 'parent')
    const child = treeBuilder.createNode(NS, 'child')

    // Act
    treeBuilder.appendChild(parent, child)

    // Assert
    expect(parent.appendChild).toBeCalledTimes(1)
    expect(parent.appendChild).toBeCalledWith(child)
    expect(mockListeners.handleContextStarted).toBeCalledTimes(1)
    expect(mockListeners.handleContextStarted).toBeCalledWith(child)
  })

  it('remove child', () => {
    // Arrange
    const parent = treeBuilder.createNode(NS, 'parent')
    const child = treeBuilder.createNode(NS, 'child')
    treeBuilder.appendChild(parent, child)

    // Act
    treeBuilder.removeChild(parent, child)

    // Assert
    expect(parent.removeChild).toBeCalledTimes(1)
    expect(parent.removeChild).toBeCalledWith(child)
    expect(mockListeners.handleContextFinished).toBeCalledTimes(1)
    expect(mockListeners.handleContextFinished).toBeCalledWith(child)
  })

  it('should callback if the context ID is changed', () => {
    // Arrange
    const node = treeBuilder.createNode(NS, 'parent')
    const parsed = { id: '1', data: 'data' }

    // Act
    treeBuilder.updateParsedContext(node, parsed)

    // Assert
    expect(mockListeners.handleContextFinished).toBeCalledTimes(1)
    expect(mockListeners.handleContextFinished).toBeCalledWith(node)
    expect(mockListeners.handleContextStarted).toBeCalledTimes(1)
    expect(mockListeners.handleContextStarted).toBeCalledWith(node)
    expect(node.parsedContext).toEqual(parsed)
    expect(node.id).toBe(parsed.id)
  })

  it('should callback if the context is changed', () => {
    // Arrange
    const node = treeBuilder.createNode(NS, 'parent')
    const parsedOld = { id: '1', data: 'old' }
    const parsedNew = { id: '1', data: 'new' }
    treeBuilder.updateParsedContext(node, parsedOld)
    jest.clearAllMocks()

    // Act
    treeBuilder.updateParsedContext(node, parsedNew)

    // Assert
    expect(mockListeners.handleContextChanged).toBeCalledTimes(1)
    expect(mockListeners.handleContextChanged).toBeCalledWith(node, parsedOld)
    expect(node.parsedContext).toEqual(parsedNew)
    expect(node.id).toBe(parsedNew.id)
  })

  it('should not callback if the parsed context is not changed', () => {
    // Arrange
    const node = treeBuilder.createNode(NS, 'parent')
    const parsedOld = { id: '1', data: 'data' }
    const parsedNew = { id: '1', data: 'data' }
    treeBuilder.updateParsedContext(node, parsedOld)
    jest.clearAllMocks()

    // Act
    treeBuilder.updateParsedContext(node, parsedNew)

    // Assert
    expect(mockListeners.handleContextChanged).toBeCalledTimes(0)
    expect(mockListeners.handleContextFinished).toBeCalledTimes(0)
    expect(mockListeners.handleContextStarted).toBeCalledTimes(0)
  })

  it('update insertion points', () => {
    // Arrange
    const node = treeBuilder.root
    const insPoints = ['southPanel', 'northPanel']

    // Act
    treeBuilder.updateInsertionPoints(node, insPoints)

    // Assert
    expect(node.insPoints).toEqual(insPoints)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
