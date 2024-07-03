import { InsertionType } from '../../../../src/core/adapters/interface'
import { IParser } from '../../../../src/core/parsers/interface'
import { NaiveBosParser } from '../../../../src/core/parsers/naive-bos-parser'
import { IContextNode } from '../../../../src/core/tree/types'
import { describe, expect, it, beforeEach } from '@jest/globals'
import { naiveBosParserElement } from '../../../data/parsers/naive-bos-parser-constants'

describe('naive bos parser', () => {
  let element: HTMLElement

  let naiveBosParser: IParser

  beforeEach(() => {
    element = naiveBosParserElement
    naiveBosParser = new NaiveBosParser()
  })

  // todo: how check?, returned null
  it('should return a parsed context', () => {
    expect(naiveBosParser.parseContext(element, 'root'))
  })

  it('should return a child', () => {
    // Arrange
    const expected = [
      {
        element: element.getElementsByClassName('posts-compose')[0],
        contextName: 'near--Posts.Compose',
      },
      {
        element: element.getElementsByClassName('component-a')[0],
        contextName: 'near--ComponentA',
      },
    ]

    // Act
    const actual = naiveBosParser.findChildElements(element, 'root')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should find insertionPoint', () => {
    // Arrange
    const expected = element.getElementsByClassName('posts-compose')[0]

    // Act
    const actual = naiveBosParser.findInsertionPoint(element, '', 'near/widget/Posts.Compose')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should find insertionPoint', () => {
    // Arrange
    const expected = element.getElementsByClassName('component-a')[0]

    // Act
    const actual = naiveBosParser.findInsertionPoint(element, '', 'near/widget/ComponentA')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should return insertionPoints', () => {
    // Arrange
    const expected = [{ name: 'near--Posts.Compose' }, { name: 'near--ComponentA' }]

    // Act
    const actual = naiveBosParser.getInsertionPoints(element, 'root')

    // Assert
    expect(actual).toStrictEqual(expected)
  })
})
