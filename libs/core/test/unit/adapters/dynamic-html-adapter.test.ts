import { DynamicHtmlAdapter } from '../../../../src/core/adapters/dynamic-html-adapter'
import { IAdapter } from '../../../../src/core/adapters/interface'
import { describe, expect, it, beforeEach } from '@jest/globals'
import { PureTreeBuilder } from '../../../../src/core/tree/pure-tree/pure-tree-builder'
import { IContextNode } from '../../../../src/core/tree/types'
import { JsonParser } from '../../../../src/core/parsers/json-parser'
import {
  configDynamicHtmlAdapter,
  dynamicHtmlAdapterDataStr,
} from '../../../data/adapters/dynamic-html-adapter-constants'

const NS = 'engine'

describe('dynamic-html-adapter', () => {
  let dynamicAdapter: IAdapter
  let mockedSite: HTMLDivElement
  const mockListeners = {
    handleContextStarted: jest.fn((context: IContextNode) => undefined),
    handleContextChanged: jest.fn((context: IContextNode, oldParsedContext: any) => undefined),
    handleContextFinished: jest.fn((context: IContextNode) => undefined),
    handleInsPointStarted: jest.fn((context: IContextNode, newInsPoint: string) => undefined),
    handleInsPointFinished: jest.fn((context: IContextNode, oldInsPoint: string) => undefined),
  }
  const mockedTreeBuilder = new PureTreeBuilder(mockListeners)
  const mockedJsonParser = new JsonParser(configDynamicHtmlAdapter)

  beforeEach(() => {
    mockedSite = document.createElement('div')
    mockedSite.innerHTML = dynamicHtmlAdapterDataStr
    dynamicAdapter = new DynamicHtmlAdapter(mockedSite, mockedTreeBuilder, NS, mockedJsonParser)
    dynamicAdapter.start()
    jest.clearAllMocks()
  })

  it('parse adapter context', () => {
    // Arrange
    const expected = {
      id: 'root',
      insPoints: ['rootPointBefore', 'rootPointAfter', 'rootPointEnd', 'rootPointBegin'],
      namespace: NS,
      parentNode: null,
      parsedContext: {
        fullname: 'Test-fullname',
        id: 'root',
        img: 'https://img.com/profile_images/id/Q_300x300.jpg',
        username: '2',
      },
      contextType: 'root',
    }

    // Act
    const node = dynamicAdapter.context

    // Assert

    expect(node.id).toBe(expected.id)
    expect(node.insPoints).toStrictEqual(expected.insPoints)
    expect(node.namespace).toBe(expected.namespace)
    expect(node.parentNode).toBe(expected.parentNode)
    expect(node.parsedContext).toStrictEqual(expected.parsedContext)
    expect(node.contextType).toBe(expected.contextType)
  })

  it('append node', async () => {
    // Arrange
    expect(dynamicAdapter.context.children.length).toBe(2)

    const mockedParentNode = mockedSite.getElementsByClassName('root-selector')[0]

    const expected = document.createElement('div')
    expected.innerHTML = `
    <div class="post-selector-point" id="post" data-testid="postTestId">
        <div class="post-root-selector" data-testid='postText' data-bos-layout-manager="layoutManager1">Post Root Insertion Point Content</div>
        <div class="post-text-selector" data-bos-layout-manager="layoutManager1">Post Text Insertion Point Content</div>
    </div>
    `

    // Act
    mockedParentNode.append(expected)
    await new Promise(process.nextTick)

    // Assert
    expect(dynamicAdapter.context.children.length).toBe(3)
    expect(expected.parentElement).toBe(mockedParentNode)

    expect(mockListeners.handleContextStarted).toBeCalledTimes(1)
    expect(mockListeners.handleContextStarted).toBeCalledWith(dynamicAdapter.context.children[2])
    expect(mockListeners.handleContextFinished).toBeCalledTimes(0)
    expect(mockListeners.handleContextChanged).toBeCalledTimes(0)
    expect(mockListeners.handleInsPointStarted).toBeCalledTimes(2)
    expect(mockListeners.handleInsPointFinished).toBeCalledTimes(0)
  })

  it('remove node', async () => {
    // Arrange
    expect(dynamicAdapter.context.children.length).toBe(2)
    const postContext = dynamicAdapter.context.children[0]

    // Act
    mockedSite.getElementsByClassName('post-selector-point')[0].remove()
    await new Promise(process.nextTick)

    // Assert
    expect(dynamicAdapter.context.children.length).toBe(1)

    expect(mockListeners.handleContextStarted).toBeCalledTimes(0)
    expect(mockListeners.handleContextFinished).toBeCalledTimes(1)
    expect(mockListeners.handleContextFinished).toBeCalledWith(postContext)
    expect(mockListeners.handleContextChanged).toBeCalledTimes(0)
    expect(mockListeners.handleInsPointStarted).toBeCalledTimes(0)
    expect(mockListeners.handleInsPointFinished).toBeCalledTimes(2)
  })

  it('change node text content', async () => {
    // Arrange
    expect(dynamicAdapter.context.parsedContext?.username).toBe('2')
    const oldParsedContext = dynamicAdapter.context.parsedContext

    // Act
    mockedSite.querySelector('div[data-testid="UserName"]>span')!.textContent = '58392'
    await new Promise(process.nextTick)

    // Assert
    expect(dynamicAdapter.context.parsedContext?.username).toBe('58392')

    expect(mockListeners.handleContextStarted).toBeCalledTimes(0)
    expect(mockListeners.handleContextFinished).toBeCalledTimes(0)
    expect(mockListeners.handleContextChanged).toBeCalledTimes(1)
    expect(mockListeners.handleContextChanged).toBeCalledWith(
      dynamicAdapter.context,
      oldParsedContext
    )
    expect(mockListeners.handleInsPointStarted).toBeCalledTimes(0)
    expect(mockListeners.handleInsPointFinished).toBeCalledTimes(0)
  })

  it('change node parameter value', async () => {
    // Arrange
    expect(dynamicAdapter.context.parsedContext?.img).toBe(
      'https://img.com/profile_images/id/Q_300x300.jpg'
    )
    const oldParsedContext = dynamicAdapter.context.parsedContext

    const imageNode: HTMLImageElement = mockedSite.querySelector(
      'div[aria-label="Account menu"]>img'
    )!
    expect(imageNode.getAttribute('src')).toBe('https://img.com/profile_images/id/Q_300x300.jpg')

    // Act
    imageNode.setAttribute('src', 'https://img.com/profile_images/id/QXWR_1300x1300.jpg')
    await new Promise(process.nextTick)

    // Assert
    expect(dynamicAdapter.context.parsedContext?.img).toBe(
      'https://img.com/profile_images/id/QXWR_1300x1300.jpg'
    )

    expect(mockListeners.handleContextStarted).toBeCalledTimes(0)
    expect(mockListeners.handleContextFinished).toBeCalledTimes(0)
    expect(mockListeners.handleContextChanged).toBeCalledTimes(1)
    expect(mockListeners.handleContextChanged).toBeCalledWith(
      dynamicAdapter.context,
      oldParsedContext
    )
    expect(mockListeners.handleInsPointStarted).toBeCalledTimes(0)
    expect(mockListeners.handleInsPointFinished).toBeCalledTimes(0)
  })

  it('change child node content', async () => {
    // Arrange
    expect(dynamicAdapter.context.children[0]!.parsedContext!.text).toBe(
      'Post Root Insertion Point Content'
    )
    expect(mockedSite.getElementsByClassName('post-root-selector')[0].textContent).toBe(
      'Post Root Insertion Point Content'
    )
    const oldParsedContext = dynamicAdapter.context.children[0]!.parsedContext

    // Act
    mockedSite.getElementsByClassName('post-root-selector')[0].textContent = 'Let it be, let it be!'
    await new Promise(process.nextTick)

    // Assert
    expect(dynamicAdapter.context.children[0]!.parsedContext!.text).toBe('Let it be, let it be!')

    expect(mockListeners.handleContextStarted).toBeCalledTimes(0)
    expect(mockListeners.handleContextFinished).toBeCalledTimes(0)
    expect(mockListeners.handleContextChanged).toBeCalledTimes(1)
    expect(mockListeners.handleContextChanged).toBeCalledWith(
      dynamicAdapter.context.children[0],
      oldParsedContext
    )
    expect(mockListeners.handleInsPointStarted).toBeCalledTimes(0)
    expect(mockListeners.handleInsPointFinished).toBeCalledTimes(0)
  })

  it('inject element to the begin of the context', () => {
    // Arrange
    const elToInject = document.createElement('p')
    elToInject.setAttribute('id', 'injected')
    elToInject.innerText = 'Injecting Widget'

    const firstNode = mockedSite.getElementsByClassName('post-selector-point')[0]

    // Act
    dynamicAdapter.injectElement(elToInject, dynamicAdapter.context, 'rootPointBegin')

    // Assert
    expect(mockedSite.querySelector('p')).toBe(elToInject)
    expect(mockedSite.querySelector('p')!.getAttribute('id')).toBe('injected')
    expect(mockedSite.querySelector('p')!.previousElementSibling).toBeNull()
    expect(mockedSite.querySelector('p')!.nextElementSibling).toBe(firstNode)
  })

  it('inject element to the end of the context', () => {
    // Arrange
    const elToInject = document.createElement('p')
    elToInject.setAttribute('id', 'injected')
    elToInject.innerText = 'Injecting Widget'

    const lastNode = mockedSite.getElementsByClassName('profile-selector')[0]

    // Act
    dynamicAdapter.injectElement(elToInject, dynamicAdapter.context, 'rootPointEnd')

    // Assert
    expect(mockedSite.querySelector('p')).toStrictEqual(elToInject)
    expect(mockedSite.querySelector('p')!.getAttribute('id')).toBe('injected')
    expect(mockedSite.querySelector('p')!.previousElementSibling).toBe(lastNode)
    expect(mockedSite.querySelector('p')!.nextElementSibling).toBeNull()
  })

  it('inject element right before the context', () => {
    // Arrange
    const elToInject = document.createElement('a')
    elToInject.setAttribute('id', 'injected')
    elToInject.innerText = 'Injecting Widget'

    const rootContainer = mockedSite.getElementsByClassName('root-selector')[0]
    const accountMenu = mockedSite.querySelector("[aria-label='Account menu']")

    // Act
    dynamicAdapter.injectElement(elToInject, dynamicAdapter.context, 'rootPointBefore')

    // Assert
    expect(mockedSite.querySelector('a')).toStrictEqual(elToInject)
    expect(mockedSite.querySelector('a')?.getAttribute('id')).toBe('injected')
    expect(mockedSite.querySelector('a')?.previousElementSibling).toBe(accountMenu)
    expect(mockedSite.querySelector('a')?.nextElementSibling).toBe(rootContainer)
  })

  it('inject element right after the context', () => {
    // Arrange
    const elToInject = document.createElement('a')
    elToInject.setAttribute('id', 'injected')
    elToInject.innerText = 'Injecting Widget'

    const rootContainer = mockedSite.getElementsByClassName('root-selector')[0]

    // Act
    dynamicAdapter.injectElement(elToInject, dynamicAdapter.context, 'rootPointAfter')

    // Assert
    expect(mockedSite.querySelector('a')).toStrictEqual(elToInject)
    expect(mockedSite.querySelector('a')?.getAttribute('id')).toBe('injected')
    expect(mockedSite.querySelector('a')?.previousElementSibling).toBe(rootContainer)
    expect(mockedSite.querySelector('a')?.nextElementSibling).toBeNull()
  })

  it('get root insertion points', () => {
    // Arrange
    const expected = [
      {
        name: 'rootPointBefore',
        insertionType: 'before',
        bosLayoutManager: 'layoutManager1',
      },
      {
        name: 'rootPointAfter',
        insertionType: 'after',
        bosLayoutManager: 'layoutManager1',
      },
      {
        name: 'rootPointEnd',
        insertionType: 'end',
        bosLayoutManager: 'layoutManager1',
      },
      {
        name: 'rootPointBegin',
        insertionType: 'begin',
        bosLayoutManager: 'layoutManager1',
      },
    ]

    // Act
    const actual = dynamicAdapter.getInsertionPoints(dynamicAdapter.context)

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('get profile insertion points', () => {
    // Arrange
    const expected = [
      {
        name: 'root',
        insertionType: 'begin',
        bosLayoutManager: 'layoutManager1',
      },
      {
        name: 'avatar',
        insertionType: 'end',
        bosLayoutManager: 'layoutManager1',
      },
    ]

    const profileContext = dynamicAdapter.context.children!.find((c) => c.id === 'profile')!

    // Act
    const actual = dynamicAdapter.getInsertionPoints(profileContext)

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('shows available insertion poins after changing the context, test insertion point listeners', async () => {
    // Arrange
    const expected = [
      {
        name: 'root',
        insertionType: 'after',
        bosLayoutManager: 'layoutManager1',
      },
      {
        name: 'text',
        insertionType: 'before',
        bosLayoutManager: 'layoutManager1',
      },
    ]

    const postContext = dynamicAdapter.context.children!.find((c) => c.id === 'post')!

    // Act
    const actual = dynamicAdapter.getInsertionPoints(postContext)

    // Assert
    expect(postContext.insPoints).toEqual(['root', 'text'])
    expect(actual).toStrictEqual(expected)

    // Arrange
    const firstInsPointNode = mockedSite.querySelector('.post-root-selector')
    firstInsPointNode?.classList.replace('post-root-selector', 'post-title-selector')
    await new Promise(process.nextTick)

    const newPostContext = dynamicAdapter.context.children!.find((c) => c.id === 'post')!

    // Act
    const newActual = dynamicAdapter.getInsertionPoints(newPostContext)

    // Assert
    expect(postContext.insPoints).toEqual(['text'])
    expect(newActual).toStrictEqual(expected)

    expect(mockListeners.handleContextStarted).toBeCalledTimes(0)
    expect(mockListeners.handleContextFinished).toBeCalledTimes(0)
    expect(mockListeners.handleContextChanged).toBeCalledTimes(0)
    expect(mockListeners.handleInsPointStarted).toBeCalledTimes(0)
    expect(mockListeners.handleInsPointFinished).toBeCalledTimes(1)
    expect(mockListeners.handleInsPointFinished).toBeCalledWith(newPostContext, 'root')

    // Arrange
    mockListeners.handleInsPointFinished.mockClear()

    firstInsPointNode?.classList.replace('post-title-selector', 'post-root-selector')
    await new Promise(process.nextTick)

    const newPostContext2 = dynamicAdapter.context.children!.find((c) => c.id === 'post')!

    // Act
    const newActual2 = dynamicAdapter.getInsertionPoints(newPostContext2)

    // Assert
    expect(postContext.insPoints).toEqual(['root', 'text'])
    expect(newActual2).toStrictEqual(expected)

    expect(mockListeners.handleContextStarted).toBeCalledTimes(0)
    expect(mockListeners.handleContextFinished).toBeCalledTimes(0)
    expect(mockListeners.handleContextChanged).toBeCalledTimes(0)
    expect(mockListeners.handleInsPointStarted).toBeCalledTimes(1)
    expect(mockListeners.handleInsPointStarted).toBeCalledWith(newPostContext2, 'root')
    expect(mockListeners.handleInsPointFinished).toBeCalledTimes(0)
  })

  it('test stop()', async () => {
    // Arrange
    expect(dynamicAdapter.context.children.length).toBe(2)

    const mockedParentNode = mockedSite.getElementsByClassName('root-selector')[0]

    const expected = document.createElement('div')
    expected.innerHTML = `
    <div class="post-selector-point" id="post" data-testid="postTestId">
        <div class="post-root-selector" data-testid='postText' data-bos-layout-manager="layoutManager1">Post Root Insertion Point Content</div>
        <div class="post-text-selector" data-bos-layout-manager="layoutManager1">Post Text Insertion Point Content</div>
    </div>
    `

    // Act
    dynamicAdapter.stop()

    mockedParentNode.append(expected)
    await new Promise(process.nextTick)

    // Assert
    expect(dynamicAdapter.context.children.length).toBe(2)
    expect(expected.parentElement).toBe(mockedParentNode)

    // Act
    dynamicAdapter.start()
    await new Promise(process.nextTick)

    // Assert
    expect(dynamicAdapter.context.children.length).toBe(3)
    expect(expected.parentElement).toBe(mockedParentNode)

    // Act
    dynamicAdapter.stop()

    mockedSite.getElementsByClassName('post-selector-point')[0].remove()
    await new Promise(process.nextTick)

    // Assert
    expect(dynamicAdapter.context.children.length).toBe(3)

    // Act
    dynamicAdapter.start()
    await new Promise(process.nextTick)

    // Assert
    expect(dynamicAdapter.context.children.length).toBe(2)
  }, 10000)
})
