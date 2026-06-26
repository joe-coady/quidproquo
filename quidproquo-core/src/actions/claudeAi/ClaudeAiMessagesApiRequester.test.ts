import { describe, expect, it } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';

import { captureRequester } from '../../testing';
import { ClaudeAiActionType } from './ClaudeAiActionType';
import { askClaudeAiMessagesApi } from './ClaudeAiMessagesApiRequester';

describe('askClaudeAiMessagesApi', () => {
  const body: Anthropic.Messages.MessageCreateParamsNonStreaming = {
    model: 'claude-opus-4-8',
    max_tokens: 256,
    messages: [{ role: 'user', content: 'hi' }],
  };

  it('yields a MessagesApi action carrying the body and api key', () => {
    const { action } = captureRequester(askClaudeAiMessagesApi(body, 'sk-key'));

    expect(action).toEqual({
      type: ClaudeAiActionType.MessagesApi,
      payload: { body, apiKey: 'sk-key' },
    });
  });

  it('returns the response the runtime resolves', () => {
    const response = { id: 'msg-1', content: [] };

    const { returned } = captureRequester(askClaudeAiMessagesApi(body, 'sk-key'), response);

    expect(returned).toBe(response);
  });
});
