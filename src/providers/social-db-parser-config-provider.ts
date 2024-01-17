import { NearSigner } from "./near-signer";
import { IParserConfigProvider } from "./parser-config-provider";
import { ParserConfig } from "../core/parsers/json-parser";
import Big from "big.js";

const JsonParserNamespace = "https://dapplets.org/ns/json/";

const ProjectIdKey = "dapplets.near";
const ParserKey = "parser";
const SettingsKey = "settings";
const SelfKey = "";

/**
 * All Mutable Web data is stored in the Social DB contract in `settings` namespace.
 * More info about the schema is here:
 * https://github.com/NearSocial/standards/blob/8713aed325226db5cf97ab9744ba78b561cc377b/types/settings/Settings.md
 *
 * Example of a data stored in the contract is here:
 * /docs/social-db-reference.json
 */
export class SocialDbParserConfigProvider implements IParserConfigProvider {
  constructor(private _signer: NearSigner, private _contractName: string) {}

  async getParserConfig(ns: string): Promise<ParserConfig | null> {
    const { accountId, parserLocalId } = this._extractParserIdFromNamespace(ns);

    const authorizedAccountId = await this._signer.getAccountId();

    if (!authorizedAccountId) throw new Error("User is not logged in");
    if (authorizedAccountId !== accountId) throw new Error("No access");

    const queryResult = await this._signer.view(this._contractName, "get", {
      keys: [
        `*/${SettingsKey}/${ProjectIdKey}/${ParserKey}/${parserLocalId}/**`,
      ],
    });

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

    const gas = undefined; // default gas
    const deposit = Big(10).pow(19).mul(2000).toFixed(0); // storage deposit ToDo: calculate it dynamically

    await this._signer.call(
      this._contractName,
      "set",
      {
        data: {
          [accountId]: {
            [SettingsKey]: {
              [ProjectIdKey]: {
                [ParserKey]: {
                  [parserLocalId]: {
                    [SelfKey]: JSON.stringify(config),
                  },
                },
              },
            },
          },
        },
      },
      gas,
      deposit
    );
  }

  private _extractParserIdFromNamespace(namespace: string): {
    accountId: string;
    parserLocalId: string;
  } {
    if (!namespace.startsWith(JsonParserNamespace)) {
      throw new Error("Invalid namespace");
    }

    const parserGlobalId = namespace.replace(JsonParserNamespace, "");

    // Example: example.near/parser/social-network
    const [accountId, entityType, parserLocalId] = parserGlobalId.split("/");

    if (entityType !== "parser" || !accountId || !parserLocalId) {
      throw new Error("Invalid namespace");
    }

    return { accountId, parserLocalId };
  }
}
