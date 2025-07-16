import { Injectable } from '@nestjs/common';
import * as convertHTML from 'html-to-text';
import { ContextService } from 'src/context/context.service';
import { FinderService } from 'src/finder/finder.service';
import { SubscriptionService } from 'src/subscription/subscription.service';
import * as convertXML from 'xml-js';

type RedditEntry = {
  feed: {
    id: {
      _text: string;
    };
    subtitle: {
      _text: string;
    };
    title: {
      _text: string;
    };
    entry: {
      author: {
        name: {
          _text: string;
        };
        uri: {
          _text: string;
        };
      };
      category: {
        _attributes: {
          term: string;
          label: string;
        };
      };
      content: {
        _attributes: {
          type: string;
        };
        _text: string;
      };
      id: {
        _text: string;
      };
      link: {
        _attributes: {
          href: string;
        };
      };
      updated: {
        _text: string;
      };
      published: {
        _text: string;
      };
      title: {
        _text: string;
      };
    }[];
  };
};

@Injectable()
export class RedditService {
  constructor(
    private subscriptionService: SubscriptionService,
    private contextService: ContextService,
    private finderService: FinderService,
  ) {}

  async grabReddits() {
    try {
      const activeSubscriptions =
        await this.subscriptionService.getSubscriptions({
          source: 'reddit',
          limit: Number.MAX_SAFE_INTEGER,
          offset: 0,
          onlyActive: true,
        });
      if (!activeSubscriptions || !activeSubscriptions.total) return;

      const usersWithActiveFinders =
        await this.finderService.getActiveFinders();

      const uniqueReddits = Array.from(
        new Set(
          activeSubscriptions.items
            .filter(
              (item) =>
                !item.isByFinder ||
                usersWithActiveFinders.includes(item.userId),
            )
            .map((sub) => sub.link),
        ),
      );

      const submissionXmls = await Promise.allSettled(
        uniqueReddits.map((reddit) =>
          this.getRSS(`https://www.reddit.com/${reddit}.rss`),
        ),
      ).then((results) =>
        results
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value),
      );
      if (!submissionXmls?.length) return [];

      const data = submissionXmls
        .filter(Boolean)
        .map((xmlText) => this.parseXML(xmlText!));

      if (!data?.length) return [];

      const reddits = data
        .filter(Boolean)
        .map((reddit) => reddit!.feed)
        .filter((reddit) => reddit.title._text !== 'search results');

      // save profiles
      await Promise.all(
        reddits.map((reddit) => {
          const id = reddit.id._text
            .replaceAll('/r/', 'r/')
            .replaceAll('.rss', '');
          return this.contextService.addContext({
            id,
            namespace: 'reddit',
            type: 'profile',
            content: {
              id,
              title: reddit.title._text,
              subtitle: reddit.subtitle._text.replaceAll('/r/', 'r/'),
              url: `https://www.reddit.com/${id}`,
            },
            parent: null,
          });
        }),
      );

      const postsToSave = reddits
        .flatMap((reddit) => reddit.entry)
        .map((reddit) => ({
          id: reddit.id._text,
          title: reddit.title._text,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          text:
            reddit.content._attributes.type === 'html' ||
            reddit.content._attributes.type === 'text/html'
              ? // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                convertHTML.htmlToText(reddit.content._text)
              : reddit.content._text,
          authorUsername: reddit.author.name._text,
          authorLink: reddit.author.uri._text,
          createdAt: reddit.published._text,
          updated: reddit.updated?._text,
          url: reddit.link._attributes.href,
          category: reddit.category._attributes.label,
        }));

      // save posts
      await Promise.all(
        postsToSave.map((post) =>
          this.contextService.addContext({
            id: post.id,
            namespace: 'reddit',
            type: 'post',
            content: post,
            parent: null,
          }),
        ),
      );

      // save edges
      await Promise.all(
        postsToSave.map((post) =>
          this.contextService.addContextEdge({
            fromContextNamespace: 'reddit',
            fromContextType: 'profile',
            fromContextId: post.category,
            toContextNamespace: 'reddit',
            toContextType: 'post',
            toContextId: post.id,
          }),
        ),
      );
    } catch (error) {
      console.error(error);
    }
  }

  async getRSS(url: string) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const xmlText = await response.text();
      return xmlText;
    } catch (error) {
      console.error('Error fetching RSS:', error);
      return null;
    }
  }

  parseXML(xmlText: string) {
    try {
      const xmlDoc = convertXML.xml2json(xmlText, { compact: true, spaces: 2 });
      return JSON.parse(xmlDoc) as RedditEntry;
    } catch (error) {
      console.error('Error parsing XML:', error);
      return null;
    }
  }
}
