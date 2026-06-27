import { Action, KeyValueStoreActionType, runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { askGetLogChatMessages } from './askGetLogChatMessages';

describe('askGetLogChatMessages', () => {
  it('queries the chat message store by correlation id and returns the page', () => {
    const page = { items: [{ correlationId: 'abc', message: 'hi', isAi: false, timestamp: 't' }], nextPageKey: 'next' };
    let captured: Action<any> | undefined;

    const result = runStory(askGetLogChatMessages('abc', 'page-key'), {
      [KeyValueStoreActionType.Query]: (action: Action<any>) => {
        captured = action;
        return page;
      },
    });

    expect(captured?.payload.options).toEqual({ nextPageKey: 'page-key' });
    expect(result).toEqual(page);
  });
});
