import { Action, KeyValueStoreActionType, kvsEqual, runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { LogChatMessage } from '../domain';
import { askGetAllLogChatMessages, askUpsert } from './logChatMessageData';

const message: LogChatMessage = {
  correlationId: 'c1',
  message: 'hello',
} as LogChatMessage;

describe('askUpsert', () => {
  it('upserts the chat message and returns it', () => {
    let captured: Action<any> | undefined;

    const result = runStory(askUpsert(message), {
      [KeyValueStoreActionType.Upsert]: (action: Action<any>) => {
        captured = action;
        return undefined;
      },
    });

    expect(captured?.payload.keyValueStoreName).toBe('qpq-log-messages');
    expect(captured?.payload.item).toBe(message);
    expect(result).toBe(message);
  });
});

describe('askGetAllLogChatMessages', () => {
  it('queries messages by correlationId and forwards the page key', () => {
    let captured: Action<any> | undefined;
    const page = { items: [message] };

    const result = runStory(askGetAllLogChatMessages('c1', 'next-key'), {
      [KeyValueStoreActionType.Query]: (action: Action<any>) => {
        captured = action;
        return page;
      },
    });

    expect(captured?.payload.keyValueStoreName).toBe('qpq-log-messages');
    expect(captured?.payload.keyCondition).toEqual(kvsEqual('correlationId', 'c1'));
    expect(captured?.payload.options.nextPageKey).toBe('next-key');
    expect(result).toBe(page);
  });
});
