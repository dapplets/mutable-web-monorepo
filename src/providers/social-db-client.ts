import Big from "big.js";
import { NearSigner } from "./near-signer";

export type StorageUsage = string;

export type StorageView = {
  usedBytes: StorageUsage;
  availableBytes: StorageUsage;
};

export type Value = any;

const EstimatedKeyValueSize = 40 * 3 + 8 + 12;
const EstimatedNodeSize = 40 * 2 + 8 + 10;

const TGas = Big(10).pow(12);
const StorageCostPerByte = Big(10).pow(19);

const MinStorageBalance = StorageCostPerByte.mul(2000);
const InitialAccountStorageBalance = StorageCostPerByte.mul(500);
const ExtraStorageBalance = StorageCostPerByte.mul(500);

const isArray = (a: any): boolean => Array.isArray(a);

const isObject = (o: any): boolean =>
  o === Object(o) && !isArray(o) && typeof o !== "function";

const isString = (s: any): boolean => typeof s === "string";

const estimateDataSize = (data: any, prevData: any): number =>
  isObject(data)
    ? Object.entries(data).reduce(
        (s, [key, value]) => {
          const prevValue = isObject(prevData) ? prevData[key] : undefined;
          return (
            s +
            (prevValue !== undefined
              ? estimateDataSize(value, prevValue)
              : key.length * 2 +
                estimateDataSize(value, undefined) +
                EstimatedKeyValueSize)
          );
        },
        isObject(prevData) ? 0 : EstimatedNodeSize
      )
    : (data?.length || 8) - (isString(prevData) ? prevData.length : 0);

const bigMax = (a: Big, b: Big) => {
  if (a && b) {
    return a.gt(b) ? a : b;
  }
  return a || b;
};

function collectKeys(obj: any): string[] {
  const keys = [];
  for (const key in obj) {
    if (obj[key] === true) {
      keys.push(key);
    } else {
      keys.push(
        ...collectKeys(obj[key]).map((subKey: string) => `${key}/${subKey}`)
      );
    }
  }
  return keys;
}

export class SocialDbClient {
  constructor(private _signer: NearSigner, private _contractName: string) {}

  async get(keys: string[]): Promise<Value> {
    return await this._signer.view(this._contractName, "get", { keys });
  }

  async keys(keys: string[]): Promise<string[]> {
    const response = await this._signer.view(this._contractName, "keys", {
      keys,
    });

    return collectKeys(response);
  }

  async set(data: Value): Promise<void> {
    const accountIds = Object.keys(data);

    if (accountIds.length !== 1) {
      throw new Error("Only one account can be updated at a time");
    }

    const [accountId] = accountIds;
    const signedAccountId = await this._signer.getAccountId();

    if (!signedAccountId) {
      throw new Error("User is not logged in");
    }

    if (accountId !== signedAccountId) {
      throw new Error("Only the owner can update the account");
    }

    const accountStorage = await this._getAccountStorage(signedAccountId);

    // ToDo: fetch current data from the contract
    //       and compare it with the new data to calculate storage cost
    const currentData = {};

    const availableBytes = Big(accountStorage?.availableBytes || "0");
    const expectedDataBalance = StorageCostPerByte.mul(
      estimateDataSize(data, currentData)
    )
      .add(accountStorage ? Big(0) : InitialAccountStorageBalance)
      .add(ExtraStorageBalance);

    const deposit = bigMax(
      expectedDataBalance.sub(availableBytes.mul(StorageCostPerByte)),
      !accountStorage ? MinStorageBalance : Big(0)
    );

    await this._signer.call(
      this._contractName,
      "set",
      { data },
      TGas.mul(100).toFixed(0), // gas
      deposit.toFixed(0)
    );
  }

  async delete(keys: string[]): Promise<void> {
    const data = await this.get(keys);
    const nullData = SocialDbClient._nullifyData(data);
    await this.set(nullData);
  }

  private async _getAccountStorage(
    accountId: string
  ): Promise<StorageView | null> {
    const resp = await this._signer.view(
      this._contractName,
      "get_account_storage",
      {
        account_id: accountId,
      }
    );

    return {
      usedBytes: resp.used_bytes,
      availableBytes: resp.available_bytes,
    };
  }

  // Utils

  static _nullifyData(data: any): any {
    return Object.fromEntries(
      Object.entries(data).map(([key, val]) => {
        const nullVal = typeof val === "object" ? this._nullifyData(val) : null;
        return [key, nullVal];
      })
    );
  }
}
