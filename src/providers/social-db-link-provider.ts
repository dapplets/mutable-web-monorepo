import Big from "big.js";
import { BosUserLink, ILinkProvider } from "./link-provider";
import { NearSigner } from "./near-signer";
import { IContextNode } from "../core/tree/types";
import { generateGuid } from "../core/utils";

const ProjectIdKey = "dapplets.near";
const LinkKey = "link";
const SettingsKey = "settings";
const WidgetKey = "widget";

/**
 * All Mutable Web data is stored in the Social DB contract in `settings` namespace.
 * More info about the schema is here:
 * https://github.com/NearSocial/standards/blob/8713aed325226db5cf97ab9744ba78b561cc377b/types/settings/Settings.md
 *
 * Example of a data stored in the contract is here:
 * /docs/social-db-reference.json
 */
export class SocialDbLinkProvider implements ILinkProvider {
  constructor(private _signer: NearSigner, private _contractName: string) {}

  async getLinksForContext(context: IContextNode): Promise<BosUserLink[]> {
    // JSON-configured parsers require id for the context
    if (
      !context.id &&
      context.namespaceURI!.startsWith("https://dapplets.org/ns/json/")
    ) {
      return [];
    }

    // ToDo: index links by context/widget/contextType/etc.
    // Fetch all links from every user
    const resp = await this._signer.view(this._contractName, "get", {
      keys: [`*/${SettingsKey}/${ProjectIdKey}/${LinkKey}/*/${WidgetKey}/*/**`],
    });

    const userLinksOutput: BosUserLink[] = [];

    for (const accountId in resp) {
      const userLinks = resp[accountId][SettingsKey][ProjectIdKey][LinkKey];
      for (const linkId in userLinks) {
        const link = userLinks[linkId];
        const userLink: BosUserLink = {
          id: linkId,
          namespace: link.namespace,
          contextType: link.contextType,
          contextId: link.contextId,
          insertionPoint: link.insertionPoint,
          component: link.component,
        };
        userLinksOutput.push(userLink);
      }
    }

    return userLinksOutput;
  }

  async createLink(link: Omit<BosUserLink, "id">): Promise<BosUserLink> {
    const linkId = generateGuid();

    const accountId = await this._signer.getAccountId();

    if (!accountId) throw new Error("User is not logged in");

    const gas = undefined; // default gas
    const deposit = Big(10).pow(19).mul(2000).toFixed(0); // storage deposit ToDo: calculate it dynamically

    await this._signer.call(
      this._contractName,
      "set",
      {
        data: {
          [accountId]: {
            [SettingsKey]: {
              [ProjectIdKey]: { [LinkKey]: { [linkId]: link } },
            },
          },
        },
      },
      gas,
      deposit
    );

    return { id: linkId, ...link };
  }
}
