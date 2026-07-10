import { describe, expect, it } from 'vitest';

import { toCacheableMessages } from './toCacheableMessages';

describe('toCacheableMessages', () => {
  it('returns the messages unchanged when caching is not requested', () => {
    const messages = [{ role: 'user' as const, content: 'hi' }];

    expect(toCacheableMessages(messages, false)).toBe(messages);
    expect(toCacheableMessages(messages, undefined)).toBe(messages);
  });

  it('returns an empty array unchanged', () => {
    expect(toCacheableMessages([], true)).toEqual([]);
  });

  it('marks only the last message with a bedrock cache point', () => {
    const messages = [
      { role: 'user' as const, content: 'what is 1+1' },
      { role: 'assistant' as const, content: 'it is 2' },
      { role: 'user' as const, content: 'oh nice' },
    ];

    expect(toCacheableMessages(messages, true)).toEqual([
      { role: 'user', content: 'what is 1+1' },
      { role: 'assistant', content: 'it is 2' },
      { role: 'user', content: 'oh nice', providerOptions: { bedrock: { cachePoint: { type: 'default' } } } },
    ]);
  });

  it('merges into any existing providerOptions on the last message rather than overwriting them', () => {
    const messages = [{ role: 'user' as const, content: 'hi', providerOptions: { other: { keep: true } } }];

    expect(toCacheableMessages(messages, true)).toEqual([
      {
        role: 'user',
        content: 'hi',
        providerOptions: { other: { keep: true }, bedrock: { cachePoint: { type: 'default' } } },
      },
    ]);
  });
});
