import { describe, expect, it } from 'vitest';

import { toAiStreamUsage } from './toAiStreamUsage';

describe('toAiStreamUsage', () => {
  it('copies the token counts across', () => {
    expect(toAiStreamUsage({ inputTokens: 1, outputTokens: 2, totalTokens: 3 })).toEqual({
      inputTokens: 1,
      outputTokens: 2,
      totalTokens: 3,
    });
  });

  it('passes through undefined token counts', () => {
    expect(toAiStreamUsage({})).toEqual({
      inputTokens: undefined,
      outputTokens: undefined,
      totalTokens: undefined,
    });
  });
});
