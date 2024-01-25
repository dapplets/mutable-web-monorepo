import { BosParserConfig } from "../core/parsers/bos-parser";
import { ParserConfig } from "../core/parsers/json-parser";
import { IContextNode } from "../core/tree/types";
import { generateGuid } from "../core/utils";
import { BosUserLink, IProvider, LinkTemplate } from "./provider";

const links: BosUserLink[] = [
  {
    id: "1",
    namespace:
      "https://dapplets.org/ns/json/dapplets.near/parser/near-social-viewer",
    contextType: "post",
    contextId: "root.near/108491730",
    insertionPoint: "like",
    bosWidgetId: "bos.dapplets.near/widget/Dog",
    authorId: "bos.dapplets.near",
  },
  {
    id: "2",
    namespace:
      "https://dapplets.org/ns/json/dapplets.near/parser/near-social-viewer",
    contextType: "post",
    contextId: "mum001.near/108508979",
    insertionPoint: "like",
    bosWidgetId: "bos.dapplets.near/widget/Cat",
    authorId: "bos.dapplets.near",
  },
  {
    id: "3",
    namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
    contextType: "post",
    contextId: "1694995303642939408",
    insertionPoint: "southPanel",
    bosWidgetId: "bos.dapplets.near/widget/Cat",
    authorId: "bos.dapplets.near",
  },
  {
    id: "4",
    namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
    contextType: "post",
    contextId: "1694995241055465828",
    insertionPoint: "southPanel",
    bosWidgetId: "bos.dapplets.near/widget/Dog",
    authorId: "bos.dapplets.near",
  },
  {
    id: "5",
    namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
    contextType: "post",
    contextId: null,
    insertionPoint: "root",
    bosWidgetId: "lisofffa.near/widget/Mutation-Overlay",
    authorId: "bos.dapplets.near",
  },
  {
    id: "6",
    namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
    contextType: "post",
    contextId: null,
    insertionPoint: "southPanel",
    bosWidgetId: "nikter.near/widget/Tipping",
    authorId: "bos.dapplets.near",
  },
];

const configs = [
  {
    namespace:
      "https://dapplets.org/ns/json/dapplets.near/parser/near-social-viewer",
    contexts: {
      root: {
        children: ["post"],
      },
      post: {
        selector: '[data-component="mob.near/widget/MainPage.N.Post"] > .post',
        props: {
          id: "string(concat(substring-before(substring-after(.//*[@data-component=\"mob.near/widget/TimeAgo\"]/../@href, 'accountId='), '&'), '/', substring-after(.//*[@data-component=\"mob.near/widget/TimeAgo\"]/../@href, '&blockHeight=')))",
          text: 'normalize-space(string(.//*[@data-component="mob.near/widget/MainPage.N.Post.Content"]//*[@data-component="mob.near/widget/N.SocialMarkdown"]))',
        },
        insertionPoints: {
          like: '[data-component="mob.near/widget/N.LikeButton"]',
        },
      },
    },
  },
  {
    namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
    contexts: {
      root: {
        props: {
          id: "string('global')",
          websiteName: "string('Twitter')",
          username:
            "substring-after(string(//header//a[@aria-label='Profile']/@href), '/')",
          fullname: "string(//*[@aria-label='Account menu']//img/@alt)",
          img: "string(//*[@aria-label='Account menu']//img/@src)",
          url: "string(//html/head/meta[@property='og:url']/@content)",
        },
        children: ["post", "profile"],
      },
      post: {
        selector: "div[data-testid=cellInnerDiv]",
        props: {
          id: "substring-after(string(.//time/../@href), 'status/')",
          text: "string(.//*[@data-testid='tweetText'])",
          authorFullname: "string(.//*[@data-testid='User-Name']//span)",
          authorUsername:
            "substring-before(substring-after(string(.//time/../@href), '/'), '/')",
          authorImg: "string(.//img/@src)",
          createdAt: "string(.//time/@datetime)",
          url: "concat('https://twitter.com/', substring-before(substring-after(string(.//time/../@href), '/'), '/'), '/status/', substring-after(string(.//time/../@href), 'status/'))",
        },
        insertionPoints: {
          root: {
            selector: ":scope > div",
            bosLayoutManager: "bos.dapplets.near/widget/ContextActionsGroup",
            insertionType: "before",
          },
          southPanel: {
            selector: "div[role=group] > *:last-child",
            insertionType: "after",
          },
          avatar: {
            selector: "div.r-18kxxzh.r-1wbh5a2.r-13qz1uu > *:last-child",
            insertionType: "after",
          },
        },
      },
      profile: {
        selector: "div[data-testid=primaryColumn]",
        props: {
          id: "substring-after(string(.//*[@data-testid='UserName']/div/div/div[2]//span), '@')",
          authorFullname: "string(.//*[@data-testid='UserName']//span[1])",
          authorUsername:
            "substring-after(string(.//*[@data-testid='UserName']/div/div/div[2]//span), '@')",
          authorImg:
            "string(.//img[contains(@alt,'Opens profile photo')]/@src)",
          url: "concat('https://twitter.com/', substring-after(string(.//*[@data-testid='UserName']/div/div/div[2]//span), '@'))",
        },
        insertionPoints: {
          southPanel: {
            selector: "[data-testid=placementTracking]",
            insertionType: "after",
          },
          avatar: {
            selector:
              "div.r-1ifxtd0.r-ymttw5.r-ttdzmv div.r-ggadg3.r-u8s1d.r-8jfcpp",
            insertionType: "inside",
          },
        },
      },
    },
  },
];

export class MemoryProvider implements IProvider {
  getParserConfigsForContext(
    context: IContextNode
  ): Promise<(ParserConfig | BosParserConfig)[]> {
    throw new Error("Method not implemented.");
  }
  createLinkTemplate(
    linkTemplate: Omit<LinkTemplate, "id">
  ): Promise<LinkTemplate> {
    throw new Error("Method not implemented.");
  }
  async getParserConfig(namespace: string): Promise<ParserConfig | null> {
    const config = configs.find((c) => c.namespace === namespace);
    if (!config) return null;
    return config as any; // ToDo: fix type
  }

  async createParserConfig(parserConfig: ParserConfig): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getLinksForContext(context: IContextNode): Promise<BosUserLink[]> {
    // ignore contexts without id
    if (!context.id) return [];

    // ToDo: match namespace

    // Add links that match the context name
    const output = links.filter(
      (link) => link.contextType === context.tagName && !link.contextId
    );

    // Add links that match the context id
    if (context.id) {
      output.push(
        ...links.filter(
          (link) =>
            link.contextType === context.tagName &&
            link.contextId === context.id
        )
      );
    }

    return output;
  }

  async createLink(link: Omit<BosUserLink, "id">): Promise<BosUserLink> {
    const linkId = generateGuid();
    const newLink: BosUserLink = { id: linkId, ...link };
    links.push(newLink);
    return newLink;
  }

  async getLinkTemplates(bosWidgetId: string): Promise<LinkTemplate[]> {
    return [];
  }

  async deleteUserLink(
    userLink: Pick<BosUserLink, "id" | "bosWidgetId">
  ): Promise<void> {
    const index = links.findIndex((l) => l.id === userLink.id);
    if (index === -1) return;
    links.splice(index, 1);
  }
}
