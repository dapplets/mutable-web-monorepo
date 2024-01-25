import { NearSigner } from "./near-signer";
import { ParserConfig } from "../core/parsers/json-parser";
import {
  BosUserLink,
  DependantContext,
  IProvider,
  LinkTemplate,
} from "./provider";
import { IContextNode } from "../core/tree/types";
import { generateGuid } from "../core/utils";
import { SocialDbClient } from "./social-db-client";
import { BosParserConfig } from "../core/parsers/bos-parser";
import { DappletsEngineNs } from "../constants";
import { sha256 } from "js-sha256";
import serializeToDeterministicJson from "json-stringify-deterministic";

const DappletsNamespace = "https://dapplets.org/ns/";
const SupportedParserTypes = ["json", "bos"];

const ProjectIdKey = "dapplets.near";
const ParserKey = "parser";
const SettingsKey = "settings";
const LinkKey = "link";
const WidgetKey = "widget";
const SelfKey = "";
const LinkTemplateKey = "linkTemplate";
const ParserContextsKey = "contexts";
const WildcardKey = "*";

/**
 * Source: https://gist.github.com/themikefuller/c1de46cbbdad02645b9dc006baedf88e
 */
function base64EncodeURL(
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

/**
 * Hashes object using deterministic serializator, SHA-256 and base64url encoding
 */
function hashObject(obj: any): string {
  const json = serializeToDeterministicJson(obj);
  const hashBytes = sha256.create().update(json).arrayBuffer();
  return base64EncodeURL(hashBytes);
}

function getValueByKey(keys: string[], obj: any): any {
  const [firstKey, ...anotherKeys] = keys;
  if (anotherKeys.length === 0) {
    return obj[firstKey];
  } else {
    return getValueByKey(anotherKeys, obj[firstKey]);
  }
}

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
    context: IContextNode
  ): Promise<(ParserConfig | BosParserConfig)[]> {
    // ToDo: implement adapters loading for another types of contexts
    if (context.namespaceURI !== DappletsEngineNs) return [];

    const contextHashKey = hashObject({
      namespace: context.namespaceURI,
      contextType: context.tagName,
      contextId: context.id,
    });

    const keys = [
      WildcardKey, // from any user
      SettingsKey,
      ProjectIdKey,
      ParserKey,
      WildcardKey, // any parser
      ParserContextsKey,
      contextHashKey,
    ];

    const availableKeys = await this.#client.keys([keys.join("/")]);
    const parserKeys = availableKeys
      .map((key) => key.substring(0, key.lastIndexOf("/"))) // discard contextHashKey
      .map((key) => key.substring(0, key.lastIndexOf("/"))); // discard ParserContextsKey

    const queryResult = await this.#client.get(parserKeys);

    const parsers = [];

    for (const key of parserKeys) {
      const json = getValueByKey(key.split("/"), queryResult);
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

    await this.#client.set(this._buildNestedData(keys, storedParserConfig));
  }

  async getLinksForContext(context: IContextNode): Promise<BosUserLink[]> {
    // JSON-configured parsers require id for the context
    if (
      !context.id &&
      context.namespaceURI!.startsWith("https://dapplets.org/ns/json/")
    ) {
      return [];
    }

    // ToDo: index links by context/widget/contextType/etc.
    // ToDo: fix GasLimitExceeded error using Social DB API
    // ToDo: cache the query
    // Fetch all links from every user
    const resp = await this.#client.get([
      `*/${SettingsKey}/${ProjectIdKey}/${LinkKey}/*/${WidgetKey}/*/**`,
    ]);

    const userLinksOutput: BosUserLink[] = [];

    for (const accountId in resp) {
      const widgetOwners = resp[accountId][SettingsKey][ProjectIdKey][LinkKey];
      for (const widgetOwnerId in widgetOwners) {
        const widgets = widgetOwners[widgetOwnerId][WidgetKey];
        for (const widgetLocalId in widgets) {
          const userLinks = widgets[widgetLocalId];
          for (const linkId in userLinks) {
            const link = userLinks[linkId];

            // Include only suitable links
            if (link.namespace && link.namespace !== context.namespaceURI)
              continue;
            if (link.contextType && link.contextType !== context.tagName)
              continue;
            if (link.contextId && link.contextId !== context.id) continue;

            const userLink: BosUserLink = {
              id: linkId,
              namespace: link.namespace,
              contextType: link.contextType,
              contextId: link.contextId ?? null,
              insertionPoint: link.insertionPoint,
              bosWidgetId: `${widgetOwnerId}/${WidgetKey}/${widgetLocalId}`,
              authorId: accountId,
            };
            userLinksOutput.push(userLink);
          }
        }
      }
    }

    return userLinksOutput;
  }

  async createLink(
    link: Omit<BosUserLink, "id" | "authorId">
  ): Promise<BosUserLink> {
    const linkId = generateGuid();
    const [widgetOwnerId, , bosWidgetLocalId] = link.bosWidgetId.split("/");

    const accountId = await this._signer.getAccountId();

    if (!accountId) throw new Error("User is not logged in");

    const keys = [
      accountId,
      SettingsKey,
      ProjectIdKey,
      LinkKey,
      widgetOwnerId,
      WidgetKey,
      bosWidgetLocalId,
      linkId,
    ];

    const storedUserLink = {
      namespace: link.namespace,
      contextType: link.contextType,
      contextId: link.contextId ?? null,
      insertionPoint: link.insertionPoint,
    };

    await this.#client.set(this._buildNestedData(keys, storedUserLink));

    return { id: linkId, ...link, authorId: accountId };
  }

  async deleteUserLink(
    userLink: Pick<BosUserLink, "id" | "bosWidgetId">
  ): Promise<void> {
    const [widgetOwnerId, , bosWidgetLocalId] = userLink.bosWidgetId.split("/");
    const accountId = await this._signer.getAccountId();

    if (!accountId) throw new Error("User is not logged in");

    const keys = [
      accountId,
      SettingsKey,
      ProjectIdKey,
      LinkKey,
      widgetOwnerId,
      WidgetKey,
      bosWidgetLocalId,
      userLink.id,
    ];

    const storedUserLink = {
      [SelfKey]: null,
      namespace: null,
      contextType: null,
      contextId: null,
      insertionPoint: null,
    };

    await this.#client.set(this._buildNestedData(keys, storedUserLink));
  }

  async getLinkTemplates(bosWidgetId: string): Promise<LinkTemplate[]> {
    const [ownerId, , bosWidgetLocalId] = bosWidgetId.split("/");
    const resp = await this.#client.get([
      `${ownerId}/${SettingsKey}/${ProjectIdKey}/${LinkTemplateKey}/${ownerId}/${WidgetKey}/${bosWidgetLocalId}/**`,
    ]);

    const linkTemplates =
      resp[ownerId]?.[SettingsKey]?.[ProjectIdKey]?.[LinkTemplateKey]?.[
        ownerId
      ]?.[WidgetKey]?.[bosWidgetLocalId];

    if (!linkTemplates) return [];

    const linksOutput: LinkTemplate[] = [];

    for (const linkTemplateId in linkTemplates) {
      const link = linkTemplates[linkTemplateId];
      const userLink: LinkTemplate = {
        id: linkTemplateId,
        namespace: link.namespace,
        contextType: link.contextType,
        contextId: link.contextId,
        insertionPoint: link.insertionPoint,
        bosWidgetId: `${ownerId}/${WidgetKey}/${bosWidgetLocalId}`,
      };
      linksOutput.push(userLink);
    }

    return linksOutput;
  }

  // #endregion

  // #region Write methods

  async createLinkTemplate(
    linkTemplate: Omit<LinkTemplate, "id">
  ): Promise<LinkTemplate> {
    const linkTemplateId = generateGuid();
    const [widgetOwnerId, , bosWidgetLocalId] =
      linkTemplate.bosWidgetId.split("/");

    const accountId = await this._signer.getAccountId();

    if (!accountId) throw new Error("User is not logged in");

    const keys = [
      accountId,
      SettingsKey,
      ProjectIdKey,
      LinkTemplateKey,
      widgetOwnerId,
      WidgetKey,
      bosWidgetLocalId,
      linkTemplateId,
    ];

    const storedLinkTemplate = {
      namespace: linkTemplate.namespace,
      contextType: linkTemplate.contextType,
      contextId: linkTemplate.contextId ?? null,
      insertionPoint: linkTemplate.insertionPoint,
    };

    await this.#client.set(this._buildNestedData(keys, storedLinkTemplate));

    return { id: linkTemplateId, ...linkTemplate };
  }

  async deleteLinkTemplate(
    linkTemplate: Pick<BosUserLink, "id" | "bosWidgetId">
  ): Promise<void> {
    const [widgetOwnerId, , bosWidgetLocalId] =
      linkTemplate.bosWidgetId.split("/");
    const accountId = await this._signer.getAccountId();

    if (!accountId) throw new Error("User is not logged in");

    const keys = [
      accountId,
      SettingsKey,
      ProjectIdKey,
      LinkTemplateKey,
      widgetOwnerId,
      WidgetKey,
      bosWidgetLocalId,
      linkTemplate.id,
    ];

    const storedLinkTemplate = {
      [SelfKey]: null,
      namespace: null,
      contextType: null,
      contextId: null,
      insertionPoint: null,
    };

    await this.#client.set(this._buildNestedData(keys, storedLinkTemplate));
  }

  async setContextIdsForParser(
    parserGlobalId: string,
    contextsToBeAdded: DependantContext[],
    contextsToBeDeleted: DependantContext[]
  ): Promise<void> {
    const [parserOwnerId, parserKey, parserLocalId] = parserGlobalId.split("/");

    if (parserKey !== ParserKey) {
      throw new Error("Invalid parser ID");
    }

    const addingKeys = contextsToBeAdded.map(hashObject);
    const deletingKeys = contextsToBeDeleted.map(hashObject);

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

    await this.#client.set(this._buildNestedData(parentKeys, savingData));
  }

  // #endregion

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
      parserGlobalId.split("/");

    if (entityType !== "parser" || !accountId || !parserLocalId) {
      throw new Error("Invalid namespace");
    }

    if (!SupportedParserTypes.includes(parserType)) {
      throw new Error(`Parser type "${parserType}" is not supported`);
    }

    return { parserType, accountId, parserLocalId };
  }

  private _buildNestedData(keys: string[], data: any): any {
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
}
