import { LayoutManager } from '../../src/layout-manager'

describe('LayoutManager', () => {
  it('build context tree for BOS-component props', () => {
    // Arrange
    const input = {
      namespace: 'dapplets.near/parser/twitter',
      contextType: 'post',
      parsedContext: {
        id: '1232131232',
        text: 'Tweet text',
      },
      parentNode: {
        namespace: 'dapplets.near/parser/twitter',
        contextType: 'global',
        parsedContext: {
          id: 'global',
          username: 'nikter',
        },
        parentNode: {
          namespace: 'engine',
          contextType: 'website',
          parsedContext: {
            id: 'twitter.com',
          },
        },
      },
    }

    const expected = {
      namespace: 'dapplets.near/parser/twitter',
      type: 'post',
      parsed: {
        id: '1232131232',
        text: 'Tweet text',
      },
      parent: {
        namespace: 'dapplets.near/parser/twitter',
        type: 'global',
        parsed: {
          id: 'global',
          username: 'nikter',
        },
        parent: {
          namespace: 'engine',
          type: 'website',
          parsed: {
            id: 'twitter.com',
          },
          parent: null,
        },
      },
    }

    // Act
    const actual = LayoutManager._buildContextTree(input as any)

    // Assert
    expect(actual).toEqual(expected)
  })
})
