import { MutationManager } from '../../src/mutation-manager'

describe('MutationManager', () => {
  it('target condition: not (positive)', () => {
    // Arrange
    const condition = { not: 'one' }
    const value = 'two'
    const expected = true

    // Act
    const actual = MutationManager._isConditionMet(condition, value)

    // Assert
    expect(actual).toEqual(expected)
  })

  it('target condition: not (negative)', () => {
    // Arrange
    const condition = { not: 'one' }
    const value = 'one'
    const expected = false

    // Act
    const actual = MutationManager._isConditionMet(condition, value)

    // Assert
    expect(actual).toEqual(expected)
  })

  it('target condition: eq (positive)', () => {
    // Arrange
    const condition = { eq: 'one' }
    const value = 'one'
    const expected = true

    // Act
    const actual = MutationManager._isConditionMet(condition, value)

    // Assert
    expect(actual).toEqual(expected)
  })

  it('target condition: eq (negative)', () => {
    // Arrange
    const condition = { eq: 'one' }
    const value = 'two'
    const expected = false

    // Act
    const actual = MutationManager._isConditionMet(condition, value)

    // Assert
    expect(actual).toEqual(expected)
  })

  it('target condition: contains (positive)', () => {
    // Arrange
    const condition = { contains: 'two' }
    const value = 'onetwothree'
    const expected = true

    // Act
    const actual = MutationManager._isConditionMet(condition, value)

    // Assert
    expect(actual).toEqual(expected)
  })

  it('target condition: contains (negative)', () => {
    // Arrange
    const condition = { eq: 'four' }
    const value = 'onetwothree'
    const expected = false

    // Act
    const actual = MutationManager._isConditionMet(condition, value)

    // Assert
    expect(actual).toEqual(expected)
  })

  it('target condition: in (positive)', () => {
    // Arrange
    const condition = { in: ['one', 'two', 'three'] }
    const value = 'one'
    const expected = true

    // Act
    const actual = MutationManager._isConditionMet(condition, value)

    // Assert
    expect(actual).toEqual(expected)
  })

  it('target condition: in (negative)', () => {
    // Arrange
    const condition = { in: ['one', 'two', 'three'] }
    const value = 'four'
    const expected = false

    // Act
    const actual = MutationManager._isConditionMet(condition, value)

    // Assert
    expect(actual).toEqual(expected)
  })

  it('target condition: endsWith (positive)', () => {
    // Arrange
    const condition = { endsWith: '--test.example.com' }
    const value = 'deploy-preview-5--test.example.com'
    const expected = true

    // Act
    const actual = MutationManager._isConditionMet(condition, value)

    // Assert
    expect(actual).toEqual(expected)
  })

  it('target condition: endsWith (negative)', () => {
    // Arrange
    const condition = { endsWith: '--dev.example.org' }
    const value = 'deploy-preview-5--test.example.com'
    const expected = false

    // Act
    const actual = MutationManager._isConditionMet(condition, value)

    // Assert
    expect(actual).toEqual(expected)
  })

  it('target conditions object (positive)', () => {
    // Arrange
    const conditions = {
      one: { not: null },
      two: { eq: 'two' },
      three: { contains: 'hre' },
      four: { in: ['four', 'five'] },
    }
    const values = {
      one: 'one',
      two: 'two',
      three: 'three',
      four: 'four',
      five: 'five',
    }
    const expected = true

    // Act
    const actual = MutationManager._areConditionsMet(conditions, values)

    // Assert
    expect(actual).toEqual(expected)
  })

  it('target conditions object (negative)', () => {
    // Arrange
    const conditions = {
      five: { not: 'five' },
    }
    const values = {
      one: 'one',
      two: 'two',
      three: 'three',
      four: 'four',
      five: 'five',
    }
    const expected = false

    // Act
    const actual = MutationManager._areConditionsMet(conditions, values)

    // Assert
    expect(actual).toEqual(expected)
  })

  it('target is met for a context (positive)', () => {
    // Arrange
    const target = {
      namespace: 'bos.dapplets.near/parser/near-social',
      contextType: 'post',
      if: {
        one: { not: null },
        two: { eq: 'two' },
        three: { contains: 'hre' },
        four: { in: ['four', 'five'] },
      },
    }
    const context = {
      namespace: 'bos.dapplets.near/parser/near-social',
      contextType: 'post',
      parsedContext: {
        one: 'one',
        two: 'two',
        three: 'three',
        four: 'four',
        five: 'five',
      },
    }
    const expected = true

    // Act
    const actual = MutationManager._isTargetMet(target, context)

    // Assert
    expect(actual).toEqual(expected)
  })

  it('builds index object', () => {
    // Arrange
    const conditions = {
      two: { index: true },
      four: { index: true },
    }
    const values = {
      one: 'one',
      two: 'two',
      three: 'three',
      four: 'four',
      five: 'five',
    }
    const expected = {
      two: 'two',
      four: 'four',
    }

    // Act
    const actual = MutationManager._buildIndexedContextValues(conditions, values)

    // Assert
    expect(actual).toEqual(expected)
  })
})
