import Big from 'big.js'
import { NearSigner } from '../near-signer/near-signer.service'
import { mergeDeep } from '../../common/merge-deep'

export type StorageUsage = string

export type StorageView = {
  usedBytes: StorageUsage
  availableBytes: StorageUsage
}

export type Value = any

const KeyDelimiter = '/'
const BlockNumberKey = ':block'

const EstimatedKeyValueSize = 40 * 3 + 8 + 12
const EstimatedNodeSize = 40 * 2 + 8 + 10

const TGas = Big(10).pow(12)
const StorageCostPerByte = Big(10).pow(19)

const MinStorageBalance = StorageCostPerByte.mul(2000)
const InitialAccountStorageBalance = StorageCostPerByte.mul(500)
const ExtraStorageBalance = StorageCostPerByte.mul(500)
const ExtraStorageForSession = Big(10).pow(22).mul(5) // 0.05 NEAR

const isArray = (a: any): boolean => Array.isArray(a)

const isObject = (o: any): boolean => o === Object(o) && !isArray(o) && typeof o !== 'function'

const isString = (s: any): boolean => typeof s === 'string'

const estimateDataSize = (data: any, prevData: any): number =>
  isObject(data)
    ? Object.entries(data).reduce(
        (s, [key, value]) => {
          const prevValue = isObject(prevData) ? prevData[key] : undefined
          return (
            s +
            (prevValue !== undefined
              ? estimateDataSize(value, prevValue)
              : key.length * 2 + estimateDataSize(value, undefined) + EstimatedKeyValueSize)
          )
        },
        isObject(prevData) ? 0 : EstimatedNodeSize
      )
    : (data?.length || 8) - (isString(prevData) ? prevData.length : 0)

const bigMax = (a: Big, b: Big) => {
  if (a && b) {
    return a.gt(b) ? a : b
  }
  return a || b
}

function collectKeys(obj: any): string[] {
  const keys = []
  for (const key in obj) {
    if (obj[key] === true) {
      keys.push(key)
    } else {
      keys.push(...collectKeys(obj[key]).map((subKey: string) => `${key}/${subKey}`))
    }
  }
  return keys
}

const stringify = (s: any): string => (isString(s) || s === null ? s : JSON.stringify(s))

const convertToStringLeaves = (data: any) => {
  return isObject(data)
    ? Object.entries(data).reduce((obj: any, [key, value]) => {
        obj[stringify(key)] = convertToStringLeaves(value)
        return obj
      }, {})
    : stringify(data)
}

const extractKeys = (data: any, prefix = ''): string[] =>
  Object.entries(data)
    .map(([key, value]) =>
      isObject(value) ? extractKeys(value, `${prefix}${key}/`) : `${prefix}${key}`
    )
    .flat()

const removeDuplicates = (data: any, prevData: any) => {
  const obj = Object.entries(data).reduce((obj: any, [key, value]) => {
    const prevValue = isObject(prevData) ? prevData[key] : undefined
    if (isObject(value)) {
      const newValue = isObject(prevValue) ? removeDuplicates(value, prevValue) : value
      if (newValue !== undefined) {
        obj[key] = newValue
      }
    } else if (value !== prevValue) {
      obj[key] = value
    }

    return obj
  }, {})
  return Object.keys(obj).length ? obj : undefined
}

/**
 * ToDo: rename to DataSource
 */
export class SocialDbService {
  constructor(
    public signer: NearSigner,
    private _contractName: string
  ) {}

  async get(keys: string[], options: { withBlockHeight?: boolean } = {}): Promise<Value> {
    return await this.signer.view(this._contractName, 'get', {
      keys,
      options: {
        with_block_height: options.withBlockHeight,
      },
    })
  }

  async keys(keys: string[]): Promise<string[]> {
    const response = await this.signer.view(this._contractName, 'keys', {
      keys,
    })

    return collectKeys(response)
  }

  async set(originalData: Value): Promise<void> {
    if (SocialDbService._isObjectEmpty(originalData)) {
      throw new Error('No data to save')
    }

    const accountIds = Object.keys(originalData)

    if (accountIds.length !== 1) {
      throw new Error(`Only one account can be updated at a time. Got ${accountIds.length}`)
    }

    const [accountId] = accountIds
    const signedAccountId = await this.signer.getAccountId()

    if (!signedAccountId) {
      throw new Error('User is not logged in')
    }

    if (accountId !== signedAccountId) {
      throw new Error(
        `Only the owner can update the account. Got ${accountId}, expected ${signedAccountId}`
      )
    }

    const accountStorage = await this._getAccountStorage(signedAccountId)

    const availableBytes = Big(accountStorage?.availableBytes || '0')

    let data = originalData
    const currentData = await this._fetchCurrentData(data)
    data = removeDuplicates(data, currentData)

    // ToDo: check is_write_permission_granted

    const expectedDataBalance = StorageCostPerByte.mul(estimateDataSize(data, currentData))
      .add(accountStorage ? Big(0) : InitialAccountStorageBalance)
      .add(ExtraStorageBalance)

    let deposit = bigMax(
      expectedDataBalance.sub(availableBytes.mul(StorageCostPerByte)),
      !accountStorage ? MinStorageBalance : Big(0)
    )

    // If deposit required add extra deposit to avoid future wallet TX confirmation
    if (!deposit.eq(Big(0))) {
      deposit = deposit.add(ExtraStorageForSession)
    }

    await this.signer.call(
      this._contractName,
      'set',
      { data },
      TGas.mul(100).toFixed(0), // gas
      deposit.toFixed(0)
    )
  }

  async delete(keys: string[]): Promise<void> {
    const data = await this.get(keys)
    const nullData = SocialDbService._nullifyData(data)
    await this.set(nullData)
  }

  // ToDo: move to repository?
  // ToDo: approximate timestamp
  getTimestampByBlockHeight(blockHeight: number): number {
    // ToDo: time reference was private, fix it
    const { avgBlockTime, height, timestamp } = this.signer.nearConfig.timeReference
    return (blockHeight - height) * avgBlockTime + timestamp
  }

  private async _getAccountStorage(accountId: string): Promise<StorageView | null> {
    const resp = await this.signer.view(this._contractName, 'get_account_storage', {
      account_id: accountId,
    })

    return {
      usedBytes: resp?.used_bytes,
      availableBytes: resp?.available_bytes,
    }
  }

  private async _fetchCurrentData(data: any) {
    const keys = extractKeys(data)
    return await this.signer.view(this._contractName, 'get', { keys })
  }

  // Utils

  static _nullifyData(data: any): any {
    return Object.fromEntries(
      Object.entries(data).map(([key, val]) => {
        const nullVal = typeof val === 'object' ? this._nullifyData(val) : null
        return [key, nullVal]
      })
    )
  }

  static _isObjectEmpty(obj: any): boolean {
    return Object.keys(obj).length === 0
  }

  public static buildNestedData(keys: string[], data: any): any {
    const [firstKey, ...anotherKeys] = keys
    if (anotherKeys.length === 0) {
      return {
        [firstKey]: data,
      }
    } else {
      return {
        [firstKey]: this.buildNestedData(anotherKeys, data),
      }
    }
  }

  public static splitObjectByDepth(obj: any, depth = 0, path: string[] = []): any {
    if (depth === 0 || typeof obj !== 'object' || obj === null) {
      return { [path.join(KeyDelimiter)]: obj }
    }

    const result: any = {}
    for (const key in obj) {
      // ToDo: should be it here?
      if (key === BlockNumberKey) continue

      const newPath = [...path, key]
      const nestedResult = this.splitObjectByDepth(obj[key], depth - 1, newPath)
      for (const nestedKey in nestedResult) {
        result[nestedKey] = nestedResult[nestedKey]
      }
    }
    return result
  }

  public static getValueByKey(keys: string[], obj: any): any {
    const [firstKey, ...anotherKeys] = keys
    if (anotherKeys.length === 0) {
      return obj?.[firstKey]
    } else {
      return this.getValueByKey(anotherKeys, obj?.[firstKey])
    }
  }
}
