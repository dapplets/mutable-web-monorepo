import { SocialDbClient } from '../../../src/providers/social-db-client'

describe('SocialDbClient', () => {
  it('nullifies data object', () => {
    // Arrange
    const input = {
      one: {
        two: {
          three: {
            '': 'data',
            three_one: 'data',
            three_two: 'data',
          },
          two_one: 'data',
        },
      },
    }

    const expected = {
      one: {
        two: {
          three: {
            '': null,
            three_one: null,
            three_two: null,
          },
          two_one: null,
        },
      },
    }

    // Act
    const actual = SocialDbClient._nullifyData(input)

    // Assert
    expect(actual).toEqual(expected)
  })
})
