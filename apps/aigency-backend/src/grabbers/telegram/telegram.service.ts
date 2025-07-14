import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ContextService } from 'src/context/context.service';
import { FinderService } from 'src/finder/finder.service';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { getMessages } from './get-messages';

// ToDo: use config???
dotenv.config();

const TELEGRAM_NAMESPACE = 'telegram';

@Injectable()
export class TelegramService {
  private T_API_ID: number;
  private T_API_HASH: string;
  private T_SESSION: string;

  constructor(
    private subscriptionService: SubscriptionService,
    private contextService: ContextService,
    private finderService: FinderService,
  ) {
    // ToDo: use config???
    this.T_API_ID = Number(process.env.TELEGRAM_API_ID);
    this.T_API_HASH = process.env.TELEGRAM_API_HASH as string;
    this.T_SESSION = process.env.TELEGRAM_SESSION as string;
  }

  async getTelegramClientAndDialogs() {
    try {
      const stringSession = new StringSession(this.T_SESSION);
      const client = new TelegramClient(
        stringSession,
        this.T_API_ID,
        this.T_API_HASH,
        {
          connectionRetries: 5,
        },
      );
      await client.connect();
      const dialogs = await client.getDialogs({});
      return { client, dialogs };
    } catch (error) {
      console.log(error);
    }
  }

  async grabSubmissions() {
    try {
      const activeSubscriptions =
        await this.subscriptionService.getSubscriptions({
          source: TELEGRAM_NAMESPACE,
          limit: Number.MAX_SAFE_INTEGER,
          offset: 0,
          onlyActive: true,
        });
      if (!activeSubscriptions || !activeSubscriptions.total) return;

      const usersWithActiveFinders =
        await this.finderService.getActiveFinders();

      const uniqueTelegrams: string[] = Array.from(
        new Set(
          activeSubscriptions.items
            .filter(
              (item) =>
                !item.isByFinder ||
                usersWithActiveFinders.includes(item.userId),
            )
            .map((sub) => sub.link)
            .filter(Boolean),
        ),
      );

      const telegramEntry = await this.getTelegramClientAndDialogs();
      if (!telegramEntry) return;
      const { client, dialogs } = telegramEntry;
      if (!client || !dialogs) return;

      const telegramMessages = [];
      for (const channelName of uniqueTelegrams) {
        try {
          const lastMessageId =
            await this.contextService.getLastSavedTelegramMessageId(
              channelName,
            );
          const messages = await getMessages({
            client,
            dialogs,
            channelName,
            lastMessageId,
          });
          telegramMessages.push(...messages);
        } catch (error) {
          console.log(error);
        }
      }

      // save profiles
      await Promise.all(
        telegramMessages.map((message) =>
          this.contextService.addContext({
            id: message.source!,
            namespace: TELEGRAM_NAMESPACE,
            type: 'profile',
            content: {
              id: message.source!,
              title: message.source,
              sourceId: message.sourceId,
              sourceName: message.sourceName,
              sourceType: message.sourceType,
              privateChannel: message.privateChannel,
              url:
                message.sourceType === 'group'
                  ? ''
                  : `https://t.me/${message.privateChannel === true ? message.sourceId?.toString().slice(4) : message.sourceName}`,
            },
            parent: null,
          }),
        ),
      );

      // save posts
      await Promise.all(
        telegramMessages.map((message) =>
          this.contextService.addContext({
            id: message.id.toString(),
            namespace: TELEGRAM_NAMESPACE,
            type: 'post',
            content: {
              id: message.id,
              source: message.source,
              sourceName: message.sourceName,
              createdAt: message.date,
              url:
                message.sourceType === 'group'
                  ? ''
                  : `https://t.me/${message.privateChannel === true ? message.sourceId?.toString().slice(4) : message.sourceName}/${message.id}`,
              text: message.text,
            },
            parent: null,
          }),
        ),
      );

      // save edges
      await Promise.all(
        telegramMessages.map((message) =>
          this.contextService.addContextEdge({
            fromContextNamespace: TELEGRAM_NAMESPACE,
            fromContextType: 'profile',
            fromContextId: message.source!,
            toContextNamespace: TELEGRAM_NAMESPACE,
            toContextType: 'post',
            toContextId: message.id.toString(),
          }),
        ),
      );
    } catch (error) {
      console.error(error);
    }
  }
}
