import { SocialDbProvider } from '../../../src/providers/social-db-provider'

describe('SocialDbProvider', () => {
  it('splits nested key-value object by given depth', () => {
    // Arrange
    const depth = 5
    const object = {
      'bos.dapplets.near': {
        settings: {
          'dapplets.near': {
            mutation: { one: { test1: 'test1' }, two: { test2: 'test2' } },
          },
        },
      },
      'dapplets.near': {
        settings: {
          'dapplets.near': { mutation: { three: { test3: 'test3' } } },
        },
      },
    }
    const expected = {
      'bos.dapplets.near/settings/dapplets.near/mutation/one': {
        test1: 'test1',
      },
      'bos.dapplets.near/settings/dapplets.near/mutation/two': {
        test2: 'test2',
      },
      'dapplets.near/settings/dapplets.near/mutation/three': {
        test3: 'test3',
      },
    }

    // Act
    const actual = SocialDbProvider._splitObjectByDepth(object, depth)

    // Assert
    expect(actual).toEqual(expected)
  })
})
