import { describe, expect, it } from 'vitest';

import { ClaudeAiActionType } from './ClaudeAiActionType';

describe('ClaudeAiActionType', () => {
  it('should have unique action type values', () => {
    const actionTypeValues = Object.values(ClaudeAiActionType);
    const uniqueValues = new Set(actionTypeValues);
    expect(uniqueValues.size).toBe(actionTypeValues.length);
  });

  it('should have the correct action type for MessagesApi', () => {
    expect(ClaudeAiActionType.MessagesApi).toBe('@quidproquo-core/ClaudeAi/MessagesApi');
  });
});
