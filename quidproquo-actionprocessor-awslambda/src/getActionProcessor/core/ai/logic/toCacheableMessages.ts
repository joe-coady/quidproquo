import type { ModelMessage } from 'ai';

const withCachePoint = (message: ModelMessage): ModelMessage => ({
  ...message,
  providerOptions: {
    ...message.providerOptions,
    bedrock: { cachePoint: { type: 'default' } },
  },
});

// Marks the newest TWO messages as cache points so the next call in the same conversation can
// read everything up to here from cache. The last message alone is not enough: callers that
// resume a halted turn append a transport-only continuation message each round, so the boundary
// after it never matches again. The second-to-last boundary (the newest durable message) is the
// one a resumed round's prefix actually re-sends byte-identically. See toCacheableSystem for the
// fixed system/tools cache point this is meant to be used alongside — Bedrock's cache lookback
// only covers a limited number of recent content blocks, so long conversations still need both.
export const toCacheableMessages = (messages: ModelMessage[], caching: boolean | undefined): ModelMessage[] => {
  if (!caching || messages.length === 0) {
    return messages;
  }

  return messages.map((message, index) => (index >= messages.length - 2 ? withCachePoint(message) : message));
};
