import { IParser } from '../../../../src/core/parsers/interface'
import { MicrodataParser } from '../../../../src/core/parsers/microdata-parser'
import { describe, expect, it, beforeEach } from '@jest/globals'
import { microdataParserElement } from '../../../data/parsers/microdata-parser-constants'
describe('microdata parser', () => {
  let element: HTMLElement

  let microdataParser: IParser

  beforeEach(() => {
    element = microdataParserElement

    microdataParser = new MicrodataParser()
  })

  it('should return a parsed context', () => {
    // Arrange
    const expected = {
      datePublished: '2024-01-30T12:00:00',
      image: 'https://example.com/image.jpg',
      jobTitle: 'Web Developer',
      name: 'Product Name',
      price: '19.99',
      url: 'https://example.com',
    }

    // Act
    const actual = microdataParser.parseContext(element, 'root')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should return a child', () => {
    // Arrange
    const expected = [
      {
        element: element.getElementsByClassName('child-person')[0],
        contextName: 'before',
      },
      {
        element: element.getElementsByClassName('child-product')[0],
        contextName: 'after',
      },
    ]

    // Act
    const actual = microdataParser.findChildElements(element, 'root')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should find insertionPoint before', () => {
    // Arrange
    const expected = element.getElementsByClassName('child-person')[0]

    // Act
    const actual = microdataParser.findInsertionPoint(element, 'root', 'before')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should find insertionPoint after', () => {
    // Arrange
    const expected = element.getElementsByClassName('child-product')[0]

    // Act
    const actual = microdataParser.findInsertionPoint(element, 'root', 'after')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should get insertionPoint', () => {
    // Arrange
    const expected = [{ name: 'before' }, { name: 'after' }]

    // Act
    const actual = microdataParser.getInsertionPoints(element, 'root')

    // Assert
    expect(actual).toStrictEqual(expected)
  })
})
