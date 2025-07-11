import { Api, TelegramClient } from 'telegram';
import { Dialog } from 'telegram/tl/custom/dialog';

const MSG_FETCH_LIMIT = 10;
const MSG_FETCH_TIME_LIMIT_MINUTES = 60;

export type Message = {
  id: number;
  text: string;
  date: number;
  source?: string;
  sourceId?: bigint;
  sourceName?: string;
  sourceType: 'channel' | 'group' | 'user' | 'unknown';
  privateChannel?: boolean;
};

export const getMessagesFromChannel = async ({
  client,
  dialog,
  isNew,
  lastMessageId,
}: {
  client: Pick<TelegramClient, 'getMessages'>;
  dialog: Pick<
    Dialog,
    'id' | 'title' | 'entity' | 'isChannel' | 'isGroup' | 'isUser'
  >;
  isNew?: boolean;
  lastMessageId?: number;
}): Promise<Message[]> => {
  const messages: Message[] = [];
  if (
    dialog.entity?.className === 'Channel' ||
    dialog.entity?.className === 'Chat'
  ) {
    let offsetDate;
    do {
      const limit = lastMessageId ? undefined : MSG_FETCH_LIMIT;
      const minId = lastMessageId ?? undefined;
      const rawMessages = await client.getMessages(dialog.entity, {
        limit,
        minId,
        offsetDate,
      });
      if (!rawMessages.length) break;
      if (
        !lastMessageId &&
        !isNew &&
        rawMessages.length === MSG_FETCH_LIMIT &&
        rawMessages[rawMessages.length - 1].date >
          Math.trunc(Date.now() / 1000 - 60 * MSG_FETCH_TIME_LIMIT_MINUTES)
      ) {
        offsetDate = rawMessages[rawMessages.length - 1].date;
      } else {
        offsetDate = undefined;
      }
      Array.prototype.push.apply(
        messages,
        rawMessages
          .filter(
            (m) =>
              lastMessageId ||
              isNew ||
              m.date >=
                Math.trunc(
                  Date.now() / 1000 - 60 * MSG_FETCH_TIME_LIMIT_MINUTES,
                ),
          )
          .filter((m) => m.message)
          .map((m) => ({
            id: m.id,
            text: m.message,
            date: m.date,
            source: dialog.title,
            sourceId: dialog.id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            sourceName: (dialog.entity as any)?.username,
            sourceType: dialog.isChannel
              ? 'channel'
              : dialog.isGroup
                ? 'group'
                : dialog.isUser
                  ? 'user'
                  : 'unknown',
            privateChannel: !!(
              dialog.entity?.className === 'Channel' && !dialog.entity.username
            ),
          })),
      );
    } while (offsetDate);
  }
  return messages;
};

export const getMessages = async ({
  client,
  dialogs,
  channelName,
  lastMessageId,
  isNew,
}: {
  client: Pick<TelegramClient, 'getMessages' | 'invoke' | 'getDialogs'>;
  dialogs: Pick<
    Dialog,
    'id' | 'title' | 'entity' | 'isChannel' | 'isGroup' | 'isUser'
  >[];
  channelName: string;
  lastMessageId?: number;
  isNew?: boolean;
}) => {
  if (/^https:\/\/t.me\//.test(channelName)) {
    channelName = channelName.replace(/^https:\/\/t.me\//, '');
  } else if (/^@/.test(channelName)) {
    channelName = channelName.slice(1);
  }

  if (channelName) {
    let dialog = dialogs.find(
      (d) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        d.title === channelName || (d.entity as any)?.username === channelName,
    );
    if (!dialog) {
      await client.invoke(
        new Api.channels.JoinChannel({
          channel: channelName,
        }),
      );
      dialogs = await client.getDialogs({});
      dialog = dialogs.find(
        (d) =>
          d.title?.toLowerCase() === channelName.toLowerCase() ||
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          (d.entity as any)?.username?.toLowerCase() ===
            channelName.toLowerCase(),
      );
      if (!dialog) {
        throw new Error('Channel not found');
      }
      return getMessagesFromChannel({ client, dialog, isNew: true });
    } else {
      return getMessagesFromChannel({ client, dialog, lastMessageId, isNew });
    }
  } else {
    const result: Message[] = [];
    for (let i = 0; i < dialogs.length; i++) {
      const messages = await getMessagesFromChannel({
        client,
        dialog: dialogs[i],
        isNew,
      });
      if (messages.length) Array.prototype.push.apply(result, messages);
    }
    return result;
  }
};
