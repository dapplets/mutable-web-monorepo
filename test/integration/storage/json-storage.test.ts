import { JsonStorage } from '../../../src/storage/json-storage'
import { LocalStorage } from '../../../src/storage/local-storage'

describe('JsonStorage', () => {
  it('get non-existing key should return undefined', async () => {
    // Arrange
    const storage = new JsonStorage(new LocalStorage())
    const expected = undefined
    const key = 'key'

    // Act
    const actual = await storage.getItem(key)

    // Assert
    expect(actual).toEqual(expected)
  })

  it('store undefined', async () => {
    // Arrange
    const storage = new JsonStorage(new LocalStorage())
    const input = undefined
    const key = 'key'

    // Act
    await storage.setItem(key, input)
    const actual = await storage.getItem(key)

    // Assert
    expect(actual).toEqual(input)
  })

  it('store null', async () => {
    // Arrange
    const storage = new JsonStorage(new LocalStorage())
    const input = null
    const key = 'key'

    // Act
    await storage.setItem(key, input)
    const actual = await storage.getItem(key)

    // Assert
    expect(actual).toEqual(input)
  })

  it('store non empty value', async () => {
    // Arrange
    const storage = new JsonStorage(new LocalStorage())
    const input = { 'some key': 'some value' }
    const key = 'key'

    // Act
    await storage.setItem(key, input)
    const actual = await storage.getItem(key)

    // Assert
    expect(actual).toEqual(input)
  })
})
