import { IParser } from '../../../../src/core/parsers/interface'
import { JsonParser } from '../../../../src/core/parsers/json-parser'
import { describe, expect, it, beforeEach } from '@jest/globals'
import { configJsonParser, jsonParserDataHtml } from '../../../data/parsers/json-parser-constants'

describe('JSON parser', () => {
  let element: HTMLElement

  let jsonParser: IParser

  beforeEach(() => {
    element = jsonParserDataHtml

    jsonParser = new JsonParser(configJsonParser)
  })

  it('should return a parsed context', () => {
    // Arrange
    const expected = {
      id: 'root',
      username: '2', // ToDo: use 2 instead of "2" // returned stroke
      fullname: 'Test-fullname',
      img: 'https://img.com/profile_images/id/Q_300x300.jpg',
    }

    // Act
    const actual = jsonParser.parseContext(element, 'root')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should find insertionPoint', () => {
    // Arrange
    const expected = element.getElementsByClassName('insertion-point-selector')[0]

    // Act
    const actual = jsonParser.findInsertionPoint(element, 'post', 'text')

    // Assert
    expect(actual).toStrictEqual(expected)
  })

  it('should find null insertionPoint', () => {
    // Act
    const actual = jsonParser.findInsertionPoint(element, 'panel', 'avatar')

    // Assert
    expect(actual).toStrictEqual(null)
  })

  it('should return insertionPoints post', () => {
    // Arrange
    const element = document.createElement('div')
    element.innerHTML = `<div class="context1-selector" data-testid="post" id='test-post' data-context="context1">
<p data-prop1="value1" data-prop2="value2" data-testid='tweetText'>Context 1 Content</p>
<div data-insertion-point="insertionPoint1" class="insertion-point-selector">
  Insertion Point 1 Content
</div>
<div data-insertion-point="insertionPoint2">
  Insertion Point 2 Content
</div>
<div data-child="child1">Child 1 Content</div>
<div data-child="child2">Child 2 Content</div>
</div>`

    const expected = [
      {
        name: 'root',
        insertionType: 'before',
        bosLayoutManager: 'layoutManagerpost',
      },
      {
        name: 'text',
        insertionType: 'after',
        bosLayoutManager: 'layoutManager1',
      },
    ]
    // Act
    const actual = jsonParser.getInsertionPoints(element.children[0], 'post')

    // Assert

    expect(actual).toStrictEqual(expected)
  })

  it('should return insertionPoints profile', () => {
    // ToDo: check that all insertion points recognized correctly
    // Arrange
    const element = document.createElement('div')
    element.innerHTML = `<div class="context2-selector" data-testid="profile" id='test-profile' data-context="context2">
<p data-prop2="value2"  data-testid='tweetProfile'>Context 2 Content</p>
<div data-insertion-point="insertionPoint3" class="insertion-point-selector-3">
Insertion Point 3 Content
</div>
<div data-insertion-point="insertionPoint4">
Insertion Point 4 Content
</div>
<div data-child="child3">Child 3 Content</div>
<div data-child="child4">Child 4 Content</div>
</div>`

    const expected = [
      {
        name: 'root',
        insertionType: 'before',
        bosLayoutManager: 'layoutManagerProfile',
      },
      {
        name: 'avatar',
        insertionType: 'after',
        bosLayoutManager: 'layoutManager2',
      },
      {
        name: 'text',
        insertionType: undefined,
        bosLayoutManager: undefined,
      },
    ]

    // Act
    const actual = jsonParser.getInsertionPoints(element.children[0], 'profile')

    // Assert

    expect(actual).toStrictEqual(expected)
  })

  it('should return insertionPoints panel', () => {
    // Arrange

    const expected = [
      { name: 'avatar', insertionType: 'after', bosLayoutManager: 'null' },
      {
        name: 'text',
        insertionType: undefined,
        bosLayoutManager: undefined,
      },
    ]

    // Act
    const actual = jsonParser.getInsertionPoints(element, 'panel')

    // Assert

    expect(actual).toStrictEqual(expected)
  })

  it('find child elements', () => {
    // Arrange
    const expected = [
      {
        contextName: 'post',
        element: element.getElementsByClassName('post-1')[0],
      },
      {
        contextName: 'post',
        element: element.getElementsByClassName('post-2')[0],
      },
      {
        contextName: 'profile',
        element: element.getElementsByClassName('profile-1')[0],
      },
      {
        contextName: 'profile',
        element: element.getElementsByClassName('profile-2')[0],
      },
    ]

    // Act
    const actual = jsonParser.findChildElements(element, 'root')

    // Assert
    expect(actual).toStrictEqual(expected)
  })
})
