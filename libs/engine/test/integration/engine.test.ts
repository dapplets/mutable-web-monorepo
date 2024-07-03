import { Engine } from '../../src/engine'
import { LocalStorage } from '../../src/storage/local-storage'
import { TextEncoder, TextDecoder } from 'util'

Object.assign(global, { TextDecoder, TextEncoder })

// ToDo: should we mock the social db contract?
// ToDo: reset jsdom state between tests
// ToDo: specify document.location explicitly. Now it's 'localhost' by default

describe('Engine', () => {
  let engine: Engine
  let i = 0

  beforeEach(() => {
    engine = new Engine({
      gatewayId: 'test',
      networkId: 'mainnet',
      selector: null as any,
      storage: new LocalStorage(`test-${++i}`),
      bosElementName: `bos-component-${++i}`,
    })
  })

  it('initializes engine', async () => {
    // Assert
    expect(engine.started).toEqual(false)
  })

  it('runs engine', async () => {
    // Act
    await engine.start()

    // Assert
    expect(engine.started).toEqual(true)
  }, 60000)

  it('no mutations are set by default', async () => {
    // Arrange
    const expected = null

    // Act
    const actual = await engine.getFavoriteMutation()

    // Assert
    expect(actual).toEqual(expected)
  })

  it('sets favorite mutation', async () => {
    // Arrange
    const mutationId = 'bos.dapplets.near/mutation/Sandbox'

    // Act
    await engine.setFavoriteMutation(mutationId)
    const actual = await engine.getFavoriteMutation()

    // Assert
    expect(actual).toEqual(mutationId)
  })

  it('sets original mutation as favorite', async () => {
    // Arrange
    const mutationId = null

    // Act
    await engine.setFavoriteMutation(mutationId)
    const actual = await engine.getFavoriteMutation()

    // Assert
    expect(actual).toEqual(mutationId)
  })

  it('returns all applications', async () => {
    // Act
    const apps = await engine.getApplications()

    // Assert
    expect(apps.length).toBeGreaterThan(0)
  })
})
