import { describe, expect, it } from 'vitest';

import { systemPrompt } from './systemPrompt';

describe('systemPrompt', () => {
  it('is a non-empty string', () => {
    expect(typeof systemPrompt).toBe('string');
    expect(systemPrompt.length).toBeGreaterThan(0);
  });

  it('describes the pure functional generator conventions it enforces', () => {
    expect(systemPrompt).toContain('AskResponse');
    expect(systemPrompt).toContain('yield*');
    expect(systemPrompt).toContain('quidproquo');
  });
});
