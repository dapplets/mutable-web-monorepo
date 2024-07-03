import { IParser } from '../../../../src/core/parsers/interface'
import { MutableWebParser } from '../../../../src/core/parsers/mweb-parser'
import { describe, expect, it, beforeEach } from '@jest/globals'
import { mwebParserElement } from '../../../data/parsers/mweb-parser-constants'

describe('mutable web parser', () => {
  let element: HTMLElement
  let mwebParser: IParser

  beforeEach(() => {
    element = mwebParserElement
    mwebParser = new MutableWebParser()
  })

  it('should return a parsed context', () => {
    // Arrange
    const expected = {
      topic: 'Mutable Web',
    }

    // Act
    const actual = mwebParser.parseContext(element, 'main')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should return a child', () => {
    // Arrange
    const expected = [
      {
        element: element.querySelector('#article-1'),
        contextName: 'article',
      },
      {
        element: element.querySelector('#article-2'),
        contextName: 'article',
      },
      {
        element: element
          .querySelector('[data-mweb-shadow-host]')!
          .shadowRoot!.querySelector('#article-3'),
        contextName: 'article',
      },
    ]

    // Act
    const actual = mwebParser.findChildElements(element, 'root')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should find insertionPoint northPanel', () => {
    // Arrange
    const expected = element.querySelector('#ins-point-1')

    // Act
    const actual = mwebParser.findInsertionPoint(element, 'root', 'northPanel')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should find insertionPoint southPanel', () => {
    // Arrange
    const expected = element.querySelector('#ins-point-2')

    // Act
    const actual = mwebParser.findInsertionPoint(element, 'root', 'southPanel')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should find insertionPoint shadowPanel', () => {
    // Arrange
    const expected = element
      .querySelector('[data-mweb-shadow-host]')!
      .shadowRoot!.querySelector('#ins-point-3')

    // Act
    const actual = mwebParser.findInsertionPoint(element, 'root', 'shadowPanel')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should get no insertionPoints', () => {
    // Arrange
    const expected: string[] = []

    // Act
    const actual = mwebParser.getInsertionPoints(element, 'root')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should get insertionPoint', () => {
    // Arrange
    const expected = [
      {
        name: 'southPanel',
        insertionType: 'end',
        bosLayoutManager: undefined,
      },
    ]

    // Act
    const elementsWithNames = mwebParser.findChildElements(element, 'root')
    const article2 = elementsWithNames.find((obj) => obj.element.getAttribute('id') === 'article-2')
    const actual = mwebParser.getInsertionPoints(article2!.element, 'root')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should get insertionPoint from shadow-root', () => {
    // Arrange
    const expected = [
      {
        name: 'shadowPanel',
        insertionType: 'end',
        bosLayoutManager: undefined,
      },
    ]

    // Act
    const elementsWithNames = mwebParser.findChildElements(element, 'root')
    const article3 = elementsWithNames.find((obj) => obj.element.getAttribute('id') === 'article-3')
    const actual = mwebParser.getInsertionPoints(article3!.element, 'root')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('gets parsed context of the first child element', () => {
    // Arrange
    const expected = {
      text: 'Article 1',
    }

    // Act
    const elementsWithNames = mwebParser.findChildElements(element, 'root')
    const article1 = elementsWithNames.find((obj) => obj.element.getAttribute('id') === 'article-1')
    const actual = mwebParser.parseContext(article1!.element, 'main')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('gets parsed context of the second child element', () => {
    // Arrange
    const expected = {
      text: 'Article 2',
    }

    // Act
    const elementsWithNames = mwebParser.findChildElements(element, 'root')
    const article2 = elementsWithNames.find((obj) => obj.element.getAttribute('id') === 'article-2')
    const actual = mwebParser.parseContext(article2!.element, 'main')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('gets parsed context of the child element in a shadow-dom', () => {
    // Arrange
    const expected = {
      text: 'Article 3',
    }

    // Act
    const elementsWithNames = mwebParser.findChildElements(element, 'root')
    const article3 = elementsWithNames.find((obj) => obj.element.getAttribute('id') === 'article-3')
    const actual = mwebParser.parseContext(article3!.element, 'main')

    // Assert
    expect(actual).toStrictEqual(expected)
  })
})
