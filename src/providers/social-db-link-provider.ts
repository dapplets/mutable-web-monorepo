import { BosUserLink, ILinkProvider } from "./link-provider";
import { NearSigner } from "./near-signer";
import { sha256 } from "js-sha256";
import jsonStringify from "json-stringify-deterministic";

export class SocialDbLinkProvider implements ILinkProvider {
  constructor(private _signer: NearSigner, private _contractName: string) {}

  async getLinksForContext(context: Element): Promise<BosUserLink[]> {
    // Ignore contexts without id
    if (!context.id) return [];

    // Links for all contexts of the specific type
    const contextTypeLinks = {
      namespace: context.namespaceURI,
      contextType: context.nodeName,
      contextId: null,
    };

    // Links for specific contexts
    const contextIdLinks = {
      namespace: context.namespaceURI,
      contextType: context.nodeName,
      contextId: context.id,
    };

    const keys = [contextTypeLinks, contextIdLinks]
      .map((indexKeyData) => sha256(jsonStringify(indexKeyData)))
      .map((indexKey) => `*/link/${indexKey}/**`);

    const queryResult = await this._signer.view(this._contractName, "get", {
      keys,
    });

    const userLinksOutput: BosUserLink[] = [];

    for (const accountId in queryResult) {
      const userLinks = queryResult[accountId]["link"];
      for (const linkKey in userLinks) {
        for (const index in userLinks[linkKey]) {
          const link = userLinks[linkKey][index];
          const userLink: BosUserLink = {
            namespace: link.namespace,
            contextType: link.contextType,
            contextId: link.contextId,
            insertionPoint: link.insertionPoint,
            insertionType: link.insertionType,
            component: link.component,
          };
          userLinksOutput.push(userLink);
        }
      }
    }

    return userLinksOutput;
  }

  async createLink(link: BosUserLink) {
    const indexKeyData = {
      namespace: link.namespace,
      contextType: link.contextType,
      contextId: link.contextId ?? null,
    };

    const indexKey = sha256(jsonStringify(indexKeyData));

    const accountId = await this._signer.getAccountId();

    if (!accountId) throw new Error("User is not logged in");

    const existingKeys = await this._signer.view(this._contractName, "keys", {
      keys: [`${accountId}/link/${indexKey}/*`],
    });

    const indexes = Object.keys(
      existingKeys?.[accountId]?.["link"]?.[indexKey] ?? {}
    );
    const lastIndex = indexes
      .map((index) => parseInt(index))
      .sort()
      .pop();
    const nextIndex = (lastIndex === undefined ? 0 : lastIndex + 1).toString();

    await this._signer.call(this._contractName, "set", {
      data: { [accountId]: { link: { [indexKey]: { [nextIndex]: link } } } },
    });
  }
}

/*
Example of the data structure in the smart contract:
{
    'dapplets.near': {
        link: {
            '3a643433173c20a6df872e157ea4c3c87fabfeb8ff5080aae1731545be557785': {
                '0': {
                    namespace: 'https://dapplets.org/ns/json/dapplets.near/parser/twitter',
                    contextType: 'post',
                    contextType: '82371873216372',
                    insertionPoint: 'southPanel',
                    insertionType: 'after',
                    component: 'dapplets.near/widget/Dog'
                }
            }
        }
    }
}
*/
