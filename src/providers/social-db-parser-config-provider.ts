import { NearSigner, TGas } from "./near-signer";
import { IParserConfigProvider } from "./parser-config-provider";
import { ParserConfig } from "../core/parsers/json-parser";
import Big from "big.js";

const JsonParserNamespace = "https://dapplets.org/ns/json/";

export class SocialDbParserConfigProvider implements IParserConfigProvider {
  constructor(private _signer: NearSigner, private _contractName: string) {}

  async getParserConfig(ns: string): Promise<ParserConfig | null> {
    const { accountId, parserLocalId } = this._extractParserIdFromNamespace(ns);

    const queryResult = await this._signer.view(this._contractName, "get", {
      keys: [`${accountId}/parser/${parserLocalId}/**`],
    });

    const parserConfig =
      queryResult[accountId]?.["parser"]?.[parserLocalId]?.[""];

    if (!parserConfig) return null;

    return JSON.parse(parserConfig);
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
            parser: { [parserLocalId]: { "": JSON.stringify(config) } },
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
