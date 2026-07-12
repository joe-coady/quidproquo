import { describe, expect, it } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';

import { captureRequester, runStory, StoryError, throwsError } from '../../testing';
import { ClaudeAiActionType } from './ClaudeAiActionType';
import { askClaudeAiMessagesApi, ClaudeAiMessagesApiErrorTypeEnum } from './ClaudeAiMessagesApiRequester';

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

  it('propagates a processor failure as a thrown StoryError', () => {
    const runFailingStory = () =>
      runStory(askClaudeAiMessagesApi(body, 'sk-bad-key'), {
        [ClaudeAiActionType.MessagesApi]: throwsError(ClaudeAiMessagesApiErrorTypeEnum.Unauthorized, 'Invalid API key.'),
      });

    expect(runFailingStory).toThrow(StoryError);
    expect(runFailingStory).toThrow(`${ClaudeAiMessagesApiErrorTypeEnum.Unauthorized}: Invalid API key.`);
  });
});

describe('ClaudeAiMessagesApiErrorTypeEnum', () => {
  // These strings are serialized into story logs and matched by callers, so the
  // full catalog and its wire format are pinned here.
  it('lists every error the processor can produce, namespaced by the action type', () => {
    expect(ClaudeAiMessagesApiErrorTypeEnum).toEqual({
      Unauthorized: `${ClaudeAiActionType.MessagesApi}-Unauthorized`,
      PermissionDenied: `${ClaudeAiActionType.MessagesApi}-PermissionDenied`,
      InvalidRequest: `${ClaudeAiActionType.MessagesApi}-InvalidRequest`,
      RateLimited: `${ClaudeAiActionType.MessagesApi}-RateLimited`,
      ServerError: `${ClaudeAiActionType.MessagesApi}-ServerError`,
      ConnectionError: `${ClaudeAiActionType.MessagesApi}-ConnectionError`,
    });
  });
});
