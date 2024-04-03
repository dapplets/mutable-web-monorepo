import { Engine } from '../../src/engine'
import { JsonStorage } from '../../src/storage/json-storage'
import { LocalStorage } from '../../src/storage/local-storage'
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

describe('Engine', () => {
  let engine: Engine

  beforeEach(() => {
    engine = new Engine({
      gatewayId: 'test',
      networkId: 'mainnet',
      selector: null as any,
      storage: new JsonStorage(new LocalStorage('test')),
    })
  })

  it('sets favorite mutation', async () => {
    // Arrange
    const mutationId = 'bos.dapplets.near/mutation/Sandbox'

    // Act
    await engine.setFavoriteMutation(mutationId)
    const actual = await engine.getFavoriteMutation()
    const mutations = await engine.getMutations()
    const mutation = mutations.find(mut => mut.id === mutationId)

    // Assert
    expect(actual).toEqual(mutationId)
    expect(mutation!.settings.isFavorite).toEqual(true)
  })
})
