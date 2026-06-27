import {
  ClaudeAiActionType,
  ConfigActionType,
  DateActionType,
  ErrorTypeEnum,
  FileActionType,
  KeyValueStoreActionType,
  PlatformActionType,
  runStory,
  StoryError,
} from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { askClaudeSendChatMessage, askLogSendChatMessage } from './askLogSendChatMessage';

const TIMESTAMP = '2026-06-26T00:00:00.000Z';

const happyMocks = {
  [DateActionType.Now]: TIMESTAMP,
  [ConfigActionType.GetGlobal]: 'claude-key-secret',
  [ConfigActionType.GetSecret]: 'sk-key',
  [KeyValueStoreActionType.Query]: { items: [{ correlationId: 'abc', isAi: false, message: 'why?', timestamp: 't' }], nextPageKey: undefined },
  [KeyValueStoreActionType.Upsert]: undefined,
  [FileActionType.ReadObjectJson]: { correlation: 'abc' },
  [ClaudeAiActionType.MessagesApi]: { content: [{ text: 'because' }] },
};

describe('askClaudeSendChatMessage', () => {
  it('persists the AI reply produced by the Claude API', () => {
    const result = runStory(askClaudeSendChatMessage('abc'), happyMocks);

    expect(result).toEqual({ correlationId: 'abc', isAi: true, message: 'because', timestamp: TIMESTAMP });
  });

  it('throws NotFound when no Claude API key is configured', () => {
    try {
      runStory(askClaudeSendChatMessage('abc'), {
        [DateActionType.Now]: TIMESTAMP,
        [ConfigActionType.GetGlobal]: undefined,
        [PlatformActionType.Delay]: undefined,
      });
      throw new Error('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(StoryError);
      expect((e as StoryError).errorType).toBe(ErrorTypeEnum.NotFound);
    }
  });
});

describe('askLogSendChatMessage', () => {
  it('records the question then returns the AI reply', () => {
    const result = runStory(askLogSendChatMessage('abc', 'why?'), happyMocks);

    expect(result).toEqual({ correlationId: 'abc', isAi: true, message: 'because', timestamp: TIMESTAMP });
  });

  it('records the error text as an AI message when the reply fails', () => {
    const result = runStory(askLogSendChatMessage('abc', 'why?'), {
      [DateActionType.Now]: TIMESTAMP,
      [ConfigActionType.GetGlobal]: undefined,
      [PlatformActionType.Delay]: undefined,
      [KeyValueStoreActionType.Upsert]: undefined,
    });

    expect(result).toEqual({ correlationId: 'abc', isAi: true, message: 'Claude API key not found.', timestamp: TIMESTAMP });
  });
});
