import { InsertionType } from '../../../../src/core/adapters/interface'
import { BosParser, BosParserConfig } from '../../../../src/core/parsers/bos-parser'
import { IParser } from '../../../../src/core/parsers/interface'
import { describe, expect, it, beforeEach } from '@jest/globals'
import { bosParserDataHtml, config } from '../../../data/parsers/bos-parser-constants'

describe('bos parser', () => {
  let element: HTMLElement

  let bosParser: IParser

  beforeEach(() => {
    element = bosParserDataHtml

    bosParser = new BosParser(config)
  })

  it('should return a parsed context', () => {
    // Arrange
    const expected = { prop1: 'value1', prop2: 'value2' }

    // Act
    const actual = bosParser.parseContext(element, 'main')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should return a child', () => {
    // Arrange
    const expected = [
      {
        element: element.getElementsByClassName('header')[0],
        contextName: 'header',
      },
      {
        element: element.getElementsByClassName('footer')[0],
        contextName: 'footer',
      },
    ]
    // Act
    const actual = bosParser.findChildElements(element, 'main')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should find insertionPoint', () => {
    // Arrange
    const expected = element.getElementsByClassName('before-header')[0]

    // Act
    const actual = bosParser.findInsertionPoint(element, 'main', 'beforeHeader')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should return insertionPoints main', () => {
    // Arrange

    const expected = [
      {
        name: 'beforeHeader',
        insertionType: 'before',
        bosLayoutManager: 'LayoutManagerA',
      },
      {
        name: 'afterHeader',
        insertionType: 'before',
        bosLayoutManager: 'LayoutManagerB',
      },
      {
        name: 'content',
        insertionType: 'after',
        bosLayoutManager: undefined,
      },
    ]

    // Act
    const actual = bosParser.getInsertionPoints(element, 'main')

    // Assert

    expect(actual).toStrictEqual(expected)
  })
})
