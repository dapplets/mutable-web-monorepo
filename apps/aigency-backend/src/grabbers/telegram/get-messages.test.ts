import bigInt from 'big-integer';
import { Dialog } from 'telegram/tl/custom/dialog';
import { expect, it, vi } from 'vitest';
import { getMessages, getMessagesFromChannel } from './get-messages';

const mockedDate = Math.trunc(Date.now() / 1000);

const twelveAPIMessages = [
  {
    id: 54872,
    message: 'Some text',
    date: mockedDate,
  },
  {
    id: 54871,
    message: 'Some text',
    date: mockedDate - 60 * 2,
  },
  {
    id: 54870,
    message: 'Some text',
    date: mockedDate - 60 * 4,
  },
  {
    id: 54869,
    message: 'Some text',
    date: mockedDate - 60 * 6,
  },
  {
    id: 54868,
    message: 'Some text',
    date: mockedDate - 60 * 8,
  },
  {
    id: 54867,
    message: 'Some text',
    date: mockedDate - 60 * 10,
  },
  {
    id: 54866,
    message: 'Some text',
    date: mockedDate - 60 * 12,
  },
  {
    id: 54865,
    message: 'Some text',
    date: mockedDate - 60 * 14,
  },
  {
    id: 54864,
    message: 'Some text',
    date: mockedDate - 60 * 16,
  },
  {
    id: 54863,
    message: 'Some text',
    date: mockedDate - 60 * 18,
  },
  {
    id: 54862,
    message: 'Some text',
    date: mockedDate - 60 * 20,
  },
  {
    id: 54861,
    message: 'Some text',
    date: mockedDate - 60 * 60 * 2,
  },
];

const mockedDialog = {
  id: bigInt(-1001429590454),
  title: 'channel-name',
  entity: {
    className: 'Channel',
    username: 'kontext_channel',
  } as unknown as Dialog['entity'],
  isChannel: true,
  isGroup: false,
  isUser: false,
};

const mockedClient = {
  getMessages: vi
    .fn()
    .mockImplementation(
      (
        _,
        {
          limit,
          offsetDate,
          minId,
        }: { limit?: number; offsetDate?: number; minId?: number },
      ) => {
        const messages = twelveAPIMessages
          .filter((m) => (minId ? m.id > minId : true))
          .filter((m) => (offsetDate ? m.date < offsetDate : true));
        return limit ? messages.slice(0, limit) : messages;
      },
    ),
  invoke: vi.fn(),
  getDialogs: vi.fn().mockImplementation(() => [mockedDialog]),
};

const twelveReturnedMessages = [
  {
    id: 54872,
    text: 'Some text',
    date: mockedDate,
    source: 'channel-name',
    sourceId: bigInt(-1001429590454),
    sourceName: 'kontext_channel',
    sourceType: 'channel',
    privateChannel: false,
  },
  {
    id: 54871,
    text: 'Some text',
    date: mockedDate - 60 * 2,
    source: 'channel-name',
    sourceId: bigInt(-1001429590454),
    sourceName: 'kontext_channel',
    sourceType: 'channel',
    privateChannel: false,
  },
  {
    id: 54870,
    text: 'Some text',
    date: mockedDate - 60 * 4,
    source: 'channel-name',
    sourceId: bigInt(-1001429590454),
    sourceName: 'kontext_channel',
    sourceType: 'channel',
    privateChannel: false,
  },
  {
    id: 54869,
    text: 'Some text',
    date: mockedDate - 60 * 6,
    source: 'channel-name',
    sourceId: bigInt(-1001429590454),
    sourceName: 'kontext_channel',
    sourceType: 'channel',
    privateChannel: false,
  },
  {
    id: 54868,
    text: 'Some text',
    date: mockedDate - 60 * 8,
    source: 'channel-name',
    sourceId: bigInt(-1001429590454),
    sourceName: 'kontext_channel',
    sourceType: 'channel',
    privateChannel: false,
  },
  {
    id: 54867,
    text: 'Some text',
    date: mockedDate - 60 * 10,
    source: 'channel-name',
    sourceId: bigInt(-1001429590454),
    sourceName: 'kontext_channel',
    sourceType: 'channel',
    privateChannel: false,
  },
  {
    id: 54866,
    text: 'Some text',
    date: mockedDate - 60 * 12,
    source: 'channel-name',
    sourceId: bigInt(-1001429590454),
    sourceName: 'kontext_channel',
    sourceType: 'channel',
    privateChannel: false,
  },
  {
    id: 54865,
    text: 'Some text',
    date: mockedDate - 60 * 14,
    source: 'channel-name',
    sourceId: bigInt(-1001429590454),
    sourceName: 'kontext_channel',
    sourceType: 'channel',
    privateChannel: false,
  },
  {
    id: 54864,
    text: 'Some text',
    date: mockedDate - 60 * 16,
    source: 'channel-name',
    sourceId: bigInt(-1001429590454),
    sourceName: 'kontext_channel',
    sourceType: 'channel',
    privateChannel: false,
  },
  {
    id: 54863,
    text: 'Some text',
    date: mockedDate - 60 * 18,
    source: 'channel-name',
    sourceId: bigInt(-1001429590454),
    sourceName: 'kontext_channel',
    sourceType: 'channel',
    privateChannel: false,
  },
  {
    id: 54862,
    text: 'Some text',
    date: mockedDate - 60 * 20,
    source: 'channel-name',
    sourceId: bigInt(-1001429590454),
    sourceName: 'kontext_channel',
    sourceType: 'channel',
    privateChannel: false,
  },
  {
    id: 54861,
    text: 'Some text',
    date: mockedDate - 60 * 60 * 2,
    source: 'channel-name',
    sourceId: bigInt(-1001429590454),
    sourceName: 'kontext_channel',
    sourceType: 'channel',
    privateChannel: false,
  },
];

it('gets messages from a new channel based on the amount limit', async () => {
  const messages = await getMessagesFromChannel({
    client: mockedClient,
    dialog: mockedDialog,
    isNew: true,
  });
  expect(messages).toEqual(twelveReturnedMessages.slice(0, 10));
});

it('gets messages from an old channel based on the time limit', async () => {
  const messages = await getMessagesFromChannel({
    client: mockedClient,
    dialog: mockedDialog,
    isNew: false,
  });
  expect(messages).toEqual(twelveReturnedMessages.slice(0, 11));
});

it('gets messages till the selected message less than the amount limit', async () => {
  const messages = await getMessagesFromChannel({
    client: mockedClient,
    dialog: mockedDialog,
    isNew: false,
    lastMessageId: 54868,
  });
  expect(messages).toEqual(twelveReturnedMessages.slice(0, 4));
});

it('gets messages till the selected message more than the amount limit', async () => {
  const messages = await getMessagesFromChannel({
    client: mockedClient,
    dialog: mockedDialog,
    isNew: false,
    lastMessageId: 54861,
  });
  expect(messages).toEqual(twelveReturnedMessages.slice(0, -1));
});

it('returns messages from a new channel based on the amount limit', async () => {
  const messages = await getMessages({
    client: mockedClient,
    dialogs: [mockedDialog],
    channelName: 'channel-name',
    isNew: true,
  });
  expect(messages).toEqual(twelveReturnedMessages.slice(0, 10));
});

it('returns messages from an old channel based on the time limit', async () => {
  const messages = await getMessages({
    client: mockedClient,
    dialogs: [mockedDialog],
    channelName: 'channel-name',
  });
  expect(messages).toEqual(twelveReturnedMessages.slice(0, 11));
});

it('returns messages till the selected message less than the amount limit', async () => {
  const messages = await getMessages({
    client: mockedClient,
    dialogs: [mockedDialog],
    channelName: 'channel-name',
    lastMessageId: 54868,
  });
  expect(messages).toEqual(twelveReturnedMessages.slice(0, 4));
});

it('returns messages till the selected message more than the amount limit', async () => {
  const messages = await getMessages({
    client: mockedClient,
    dialogs: [mockedDialog],
    channelName: 'channel-name',
    lastMessageId: 54861,
  });
  expect(messages).toEqual(twelveReturnedMessages.slice(0, -1));
});

it('returns messages from a channel with a different letter cases in the name', async () => {
  const messages = await getMessages({
    client: mockedClient,
    dialogs: [mockedDialog],
    channelName: 'Channel-Name',
  });
  expect(messages).toEqual(twelveReturnedMessages.slice(0, 10));
});
