import { Cacheable } from 'caching-decorator'
import { SocialDbService } from '../social-db/social-db.service'
import { IndexedLink, LinkIndexObject } from './user-link.entity'
import serializeToDeterministicJson from 'json-stringify-deterministic'
import { sha256 } from 'js-sha256'
import { NearSigner } from '../near-signer/near-signer.service'
import { BaseRepository } from '../base/base.repository'

const ProjectIdKey = 'dapplets.near'
const SettingsKey = 'settings'
const LinkKey = 'link'

export class UserLinkRepository extends BaseRepository<IndexedLink> {
  constructor(
    socialDb: SocialDbService,
    private _signer: NearSigner // ToDo: is it necessary dependency injection?
  ) {
    super(IndexedLink, socialDb)
  }

  @Cacheable({ ttl: 60000 })
  async getItemsByIndex(entity: Partial<IndexedLink>): Promise<IndexedLink[]> {
    return super.getItemsByIndex(entity)
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

    await this.socialDb.set(SocialDbService.buildNestedData(keys, storedAppLink))

    return IndexedLink.create({
      id: `${accountId}/link/${linkId}`,
      indexes: [index],
    })
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
