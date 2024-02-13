import { sha256 } from "js-sha256";
import serializeToDeterministicJson from "json-stringify-deterministic";

import { NearSigner } from "./near-signer";
import { ParserConfig } from "../core/parsers/json-parser";
import {
  AppMetadata,
  ContextFilter,
  IProvider,
  UserLinkId,
  AppId,
  Mutation,
  IndexedLink,
  LinkIndexObject,
  MutationId,
} from "./provider";
import { generateGuid } from "../core/utils";
import { SocialDbClient } from "./social-db-client";
import { BosParserConfig } from "../core/parsers/bos-parser";
import { DappletsEngineNs } from "../constants";

const DappletsNamespace = "https://dapplets.org/ns/";
const SupportedParserTypes = ["json", "bos"];

const ProjectIdKey = "dapplets.near";
const ParserKey = "parser";
const SettingsKey = "settings";
const LinkKey = "link";
const SelfKey = "";
const ParserContextsKey = "contexts";
const AppKey = "app";
const MutationKey = "mutation";
const WildcardKey = "*";
const RecursiveWildcardKey = "**";
const IndexesKey = "indexes";
const KeyDelimiter = "/";

/**
 * All Mutable Web data is stored in the Social DB contract in `settings` namespace.
 * More info about the schema is here:
 * https://github.com/NearSocial/standards/blob/8713aed325226db5cf97ab9744ba78b561cc377b/types/settings/Settings.md
 *
 * Example of a data stored in the contract is here:
 * /docs/social-db-reference.json
 */
export class SocialDbProvider implements IProvider {
  #client: SocialDbClient;

  constructor(private _signer: NearSigner, _contractName: string) {
    this.#client = new SocialDbClient(_signer, _contractName);
  }

  // #region Read methods

  async getParserConfigsForContext(
    contextFilter: ContextFilter
  ): Promise<(ParserConfig | BosParserConfig)[]> {
    // ToDo: implement adapters loading for another types of contexts
    if (contextFilter.namespace !== DappletsEngineNs) return [];

    const contextHashKey = SocialDbProvider._hashObject(contextFilter);

    const keys = [
      WildcardKey, // from any user
      SettingsKey,
      ProjectIdKey,
      ParserKey,
      WildcardKey, // any parser
      ParserContextsKey,
      contextHashKey,
    ];

    const availableKeys = await this.#client.keys([keys.join(KeyDelimiter)]);
    const parserKeys = availableKeys
      .map((key) => key.substring(0, key.lastIndexOf(KeyDelimiter))) // discard contextHashKey
      .map((key) => key.substring(0, key.lastIndexOf(KeyDelimiter))); // discard ParserContextsKey

    const queryResult = await this.#client.get(parserKeys);

    const parsers = [];

    for (const key of parserKeys) {
      const json = SocialDbProvider._getValueByKey(
        key.split(KeyDelimiter),
        queryResult
      );
      parsers.push(JSON.parse(json));
    }

    return parsers;
  }

  async getParserConfig(
    ns: string
  ): Promise<ParserConfig | BosParserConfig | null> {
    const { accountId, parserLocalId } = this._extractParserIdFromNamespace(ns);

    const queryResult = await this.#client.get([
      `*/${SettingsKey}/${ProjectIdKey}/${ParserKey}/${parserLocalId}/**`,
    ]);

    const parserConfigJson =
      queryResult[accountId]?.[SettingsKey]?.[ProjectIdKey]?.[ParserKey]?.[
        parserLocalId
      ]?.[SelfKey];

    if (!parserConfigJson) return null;

    return JSON.parse(parserConfigJson);
  }

  async getAllAppIds(): Promise<AppId[]> {
    const keys = [WildcardKey, SettingsKey, ProjectIdKey, AppKey, WildcardKey];
    const appKeys = await this.#client.keys([keys.join(KeyDelimiter)]);

    return appKeys.map((key) => {
      const [authorId, , , , localAppId] = key.split(KeyDelimiter);
      return [authorId, AppKey, localAppId].join(KeyDelimiter);
    });
  }

  async getLinksByIndex(indexObject: LinkIndexObject): Promise<IndexedLink[]> {
    const index = SocialDbProvider._hashObject(indexObject);

    const key = [
      WildcardKey, // from any user
      SettingsKey,
      ProjectIdKey,
      LinkKey,
      WildcardKey, // any user link id
      IndexesKey,
      index,
    ].join(KeyDelimiter);

    // ToDo: batch requests
    const resp = await this.#client.keys([key]);

    return resp.map((key) => {
      const [authorId, , , , id] = key.split(KeyDelimiter);
      return { id, authorId };
    });
  }

  async getApplication(globalAppId: AppId): Promise<AppMetadata | null> {
    const [authorId, , appLocalId] = globalAppId.split(KeyDelimiter);

    const keys = [authorId, SettingsKey, ProjectIdKey, AppKey, appLocalId];
    const queryResult = await this.#client.get([
      [...keys, RecursiveWildcardKey].join(KeyDelimiter),
    ]);

    const mutation = SocialDbProvider._getValueByKey(keys, queryResult);

    if (!mutation?.[SelfKey]) return null;

    return {
      ...JSON.parse(mutation[SelfKey]),
      id: globalAppId,
      appLocalId,
      authorId,
    };
  }

  async getMutation(globalMutationId: MutationId): Promise<Mutation | null> {
    const [authorId, , mutationLocalId] = globalMutationId.split(KeyDelimiter);

    const keys = [
      authorId,
      SettingsKey,
      ProjectIdKey,
      MutationKey,
      mutationLocalId,
    ];
    const queryResult = await this.#client.get([
      [...keys, RecursiveWildcardKey].join(KeyDelimiter),
    ]);

    const mutation = SocialDbProvider._getValueByKey(keys, queryResult);

    if (!mutation) return null;

    return {
      id: globalMutationId,
      metadata: mutation.metadata,
      apps: mutation.apps ? JSON.parse(mutation.apps) : [],
    };
  }

  async getMutations(): Promise<Mutation[]> {
    const keys = [
      WildcardKey, // any author id
      SettingsKey,
      ProjectIdKey,
      MutationKey,
      WildcardKey, // any mutation local id
    ];

    const queryResult = await this.#client.get([
      [...keys, RecursiveWildcardKey].join(KeyDelimiter),
    ]);

    const mutationsByKey = SocialDbProvider._splitObjectByDepth(
      queryResult,
      keys.length
    );

    const mutations = Object.entries(mutationsByKey).map(
      ([key, value]: [string, any]) => {
        const [accountId, , , , localMutationId] = key.split(KeyDelimiter);
        const mutationId = [accountId, MutationKey, localMutationId].join(
          KeyDelimiter
        );

        return {
          id: mutationId,
          metadata: value.metadata,
          apps: JSON.parse(value.apps),
        };
      }
    );

    return mutations;
  }

  // #endregion

  // #region Write methods

  async createLink(indexObject: LinkIndexObject): Promise<IndexedLink> {
    const linkId = generateGuid();

    const accountId = await this._signer.getAccountId();

    if (!accountId) throw new Error("User is not logged in");

    const index = SocialDbProvider._hashObject(indexObject);

    const keys = [accountId, SettingsKey, ProjectIdKey, LinkKey, linkId];

    const storedAppLink = {
      indexes: {
        [index]: "",
      },
    };

    await this.#client.set(
      SocialDbProvider._buildNestedData(keys, storedAppLink)
    );

    return {
      id: linkId,
      authorId: accountId,
    };
  }

  async deleteUserLink(linkId: UserLinkId): Promise<void> {
    const accountId = await this._signer.getAccountId();

    if (!accountId) throw new Error("User is not logged in");

    // ToDo: check link ownership?

    const keys = [
      accountId,
      SettingsKey,
      ProjectIdKey,
      LinkKey,
      linkId,
      RecursiveWildcardKey,
    ];

    await this.#client.delete([keys.join(KeyDelimiter)]);
  }

  async createApplication(
    appMetadata: Omit<AppMetadata, "authorId" | "appLocalId">
  ): Promise<AppMetadata> {
    const [authorId, , appLocalId] = appMetadata.id.split(KeyDelimiter);

    const keys = [authorId, SettingsKey, ProjectIdKey, AppKey, appLocalId];

    const storedAppMetadata = {
      [SelfKey]: JSON.stringify({
        targets: appMetadata.targets,
      }),
    };

    await this.#client.set(
      SocialDbProvider._buildNestedData(keys, storedAppMetadata)
    );

    return {
      ...appMetadata,
      appLocalId,
      authorId,
    };
  }

  async createMutation(mutation: Mutation): Promise<Mutation> {
    const [authorId, , mutationLocalId] = mutation.id.split(KeyDelimiter);

    const keys = [
      authorId,
      SettingsKey,
      ProjectIdKey,
      MutationKey,
      mutationLocalId,
    ];

    const storedAppMetadata = {
      metadata: mutation.metadata,
      apps: mutation.apps ? JSON.stringify(mutation.apps) : null,
    };

    await this.#client.set(
      SocialDbProvider._buildNestedData(keys, storedAppMetadata)
    );

    return mutation;
  }

  async createParserConfig(config: ParserConfig): Promise<void> {
    const { accountId, parserLocalId } = this._extractParserIdFromNamespace(
      config.namespace
    );

    const keys = [
      accountId,
      SettingsKey,
      ProjectIdKey,
      ParserKey,
      parserLocalId,
    ];

    const storedParserConfig = {
      [SelfKey]: JSON.stringify(config),
    };

    await this.#client.set(
      SocialDbProvider._buildNestedData(keys, storedParserConfig)
    );
  }

  async setContextIdsForParser(
    parserGlobalId: string,
    contextsToBeAdded: ContextFilter[],
    contextsToBeDeleted: ContextFilter[]
  ): Promise<void> {
    const [parserOwnerId, parserKey, parserLocalId] =
      parserGlobalId.split(KeyDelimiter);

    if (parserKey !== ParserKey) {
      throw new Error("Invalid parser ID");
    }

    const addingKeys = contextsToBeAdded.map(SocialDbProvider._hashObject);
    const deletingKeys = contextsToBeDeleted.map(SocialDbProvider._hashObject);

    const savingData = {
      ...Object.fromEntries(addingKeys.map((k) => [k, ""])),
      ...Object.fromEntries(deletingKeys.map((k) => [k, null])),
    };

    // Key example:
    // bos.dapplets.near/settings/dapplets.near/parser/social-network/contexts
    const parentKeys = [
      parserOwnerId,
      SettingsKey,
      ProjectIdKey,
      ParserKey,
      parserLocalId,
      ParserContextsKey,
    ];

    await this.#client.set(
      SocialDbProvider._buildNestedData(parentKeys, savingData)
    );
  }

  // #endregion

  // #region Private methods

  private _extractParserIdFromNamespace(namespace: string): {
    parserType: string;
    accountId: string;
    parserLocalId: string;
  } {
    if (!namespace.startsWith(DappletsNamespace)) {
      throw new Error("Invalid namespace");
    }

    const parserGlobalId = namespace.replace(DappletsNamespace, "");

    // Example: example.near/parser/social-network
    const [parserType, accountId, entityType, parserLocalId] =
      parserGlobalId.split(KeyDelimiter);

    if (entityType !== "parser" || !accountId || !parserLocalId) {
      throw new Error("Invalid namespace");
    }

    if (!SupportedParserTypes.includes(parserType)) {
      throw new Error(`Parser type "${parserType}" is not supported`);
    }

    return { parserType, accountId, parserLocalId };
  }

  // #endregion

  // #region Utils

  static _buildNestedData(keys: string[], data: any): any {
    const [firstKey, ...anotherKeys] = keys;
    if (anotherKeys.length === 0) {
      return {
        [firstKey]: data,
      };
    } else {
      return {
        [firstKey]: this._buildNestedData(anotherKeys, data),
      };
    }
  }

  static _splitObjectByDepth(obj: any, depth = 0, path: string[] = []): any {
    if (depth === 0 || typeof obj !== "object" || obj === null) {
      return { [path.join(KeyDelimiter)]: obj };
    }

    const result: any = {};
    for (const key in obj) {
      const newPath = [...path, key];
      const nestedResult = this._splitObjectByDepth(
        obj[key],
        depth - 1,
        newPath
      );
      for (const nestedKey in nestedResult) {
        result[nestedKey] = nestedResult[nestedKey];
      }
    }
    return result;
  }

  /**
   * Hashes object using deterministic serializator, SHA-256 and base64url encoding
   */
  static _hashObject(obj: any): string {
    const json = serializeToDeterministicJson(obj);
    const hashBytes = sha256.create().update(json).arrayBuffer();
    return this._base64EncodeURL(hashBytes);
  }

  /**
   * Source: https://gist.github.com/themikefuller/c1de46cbbdad02645b9dc006baedf88e
   */
  static _base64EncodeURL(
    byteArray: ArrayLike<number> | ArrayBufferLike
  ): string {
    return btoa(
      Array.from(new Uint8Array(byteArray))
        .map((val) => {
          return String.fromCharCode(val);
        })
        .join("")
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/\=/g, "");
  }

  static _getValueByKey(keys: string[], obj: any): any {
    const [firstKey, ...anotherKeys] = keys;
    if (anotherKeys.length === 0) {
      return obj?.[firstKey];
    } else {
      return this._getValueByKey(anotherKeys, obj?.[firstKey]);
    }
  }

  // #endregion
}
