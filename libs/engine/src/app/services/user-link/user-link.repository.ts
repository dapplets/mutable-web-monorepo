import { Cacheable } from 'caching-decorator'
import { SocialDbService } from '../social-db/social-db.service'
import { IndexedLink, LinkIndexObject, UserLinkId } from './user-link.entity'
import serializeToDeterministicJson from 'json-stringify-deterministic'
import { sha256 } from 'js-sha256'
import { NearSigner } from '../near-signer/near-signer.service'

const ProjectIdKey = 'dapplets.near'
const SettingsKey = 'settings'
const LinkKey = 'link'
const WildcardKey = '*'
const RecursiveWildcardKey = '**'
const IndexesKey = 'indexes'
const KeyDelimiter = '/'

export class UserLinkRepository {
  constructor(
    private _socialDb: SocialDbService,
    private _signer: NearSigner // ToDo: is it necessary dependency injection?
  ) {}

  @Cacheable({ ttl: 60000 })
  async getLinksByIndex(indexObject: LinkIndexObject): Promise<IndexedLink[]> {
    const index = UserLinkRepository._hashObject(indexObject)

    const key = [
      WildcardKey, // from any user
      SettingsKey,
      ProjectIdKey,
      LinkKey,
      WildcardKey, // any user link id
      IndexesKey,
      index,
    ].join(KeyDelimiter)

    // ToDo: batch requests
    const resp = await this._socialDb.keys([key])

    return resp.map((key) => {
      const [authorId, , , , id] = key.split(KeyDelimiter)
      return { id, authorId }
    })
  }

  async createLink(indexObject: LinkIndexObject): Promise<IndexedLink> {
    const linkId = UserLinkRepository._generateGuid()

    const accountId = await this._signer.getAccountId()

    if (!accountId) throw new Error('User is not logged in')

    const index = UserLinkRepository._hashObject(indexObject)

    const keys = [accountId, SettingsKey, ProjectIdKey, LinkKey, linkId]

    const storedAppLink = {
      indexes: {
        [index]: '',
      },
    }

    await this._socialDb.set(SocialDbService.buildNestedData(keys, storedAppLink))

    return {
      id: linkId,
      authorId: accountId,
    }
  }

  async deleteUserLink(linkId: UserLinkId): Promise<void> {
    const accountId = await this._signer.getAccountId()

    if (!accountId) throw new Error('User is not logged in')

    // ToDo: check link ownership?

    const keys = [accountId, SettingsKey, ProjectIdKey, LinkKey, linkId, RecursiveWildcardKey]

    await this._socialDb.delete([keys.join(KeyDelimiter)])
  }

  /**
   * Hashes object using deterministic serializator, SHA-256 and base64url encoding
   */
  static _hashObject(obj: any): string {
    const json = serializeToDeterministicJson(obj)
    const hashBytes = sha256.create().update(json).arrayBuffer()
    return this._base64EncodeURL(hashBytes)
  }

  /**
   * Source: https://gist.github.com/themikefuller/c1de46cbbdad02645b9dc006baedf88e
   */
  static _base64EncodeURL(byteArray: ArrayLike<number> | ArrayBufferLike): string {
    return btoa(
      Array.from(new Uint8Array(byteArray))
        .map((val) => {
          return String.fromCharCode(val)
        })
        .join('')
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/\=/g, '')
  }

  static _generateGuid() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
}
