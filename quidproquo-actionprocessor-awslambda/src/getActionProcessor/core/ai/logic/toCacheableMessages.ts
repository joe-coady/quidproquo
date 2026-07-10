import type { ModelMessage } from 'ai';

// Marks the newest message as a cache point so the next call in the same conversation can read
// everything up to here from cache. See toCacheableSystem for the fixed system/tools cache point
// this is meant to be used alongside — Bedrock's cache lookback only covers a limited number of
// recent content blocks, so long conversations still need both.
export const toCacheableMessages = (messages: ModelMessage[], caching: boolean | undefined): ModelMessage[] => {
  if (!caching || messages.length === 0) {
    return messages;
  }

  const lastMessage = messages[messages.length - 1];

  return [
    ...messages.slice(0, -1),
    {
      ...lastMessage,
      providerOptions: {
        ...lastMessage.providerOptions,
        bedrock: { cachePoint: { type: 'default' } },
      },
    },
  ];
};
