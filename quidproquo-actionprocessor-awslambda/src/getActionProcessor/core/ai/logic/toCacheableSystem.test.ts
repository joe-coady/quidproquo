import { describe, expect, it } from 'vitest';

import { toCacheableSystem } from './toCacheableSystem';

describe('toCacheableSystem', () => {
  it('returns undefined when there is no system prompt', () => {
    expect(toCacheableSystem(undefined, true)).toBeUndefined();
  });

  it('returns the plain string when caching is not requested', () => {
    expect(toCacheableSystem('sys', false)).toBe('sys');
    expect(toCacheableSystem('sys', undefined)).toBe('sys');
  });

  it('wraps the system prompt with a bedrock cache point when caching is requested', () => {
    expect(toCacheableSystem('sys', true)).toEqual({
      role: 'system',
      content: 'sys',
      providerOptions: {
        bedrock: { cachePoint: { type: 'default' } },
      },
    });
  });
});
