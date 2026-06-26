import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { askKeyValueStoreDelete } from './KeyValueStoreDeleteActionRequester';

describe('askKeyValueStoreDelete', () => {
  it('yields a Delete action with key, sort key and options', () => {
    const options = { consistentRead: true };

    const { action } = captureRequester(askKeyValueStoreDelete('users', 'user-1', 'sort-1', options));

    expect(action).toEqual({
      type: KeyValueStoreActionType.Delete,
      payload: { keyValueStoreName: 'users', key: 'user-1', sortKey: 'sort-1', options },
    });
  });

  it('leaves sort key and options undefined when omitted', () => {
    const { action } = captureRequester(askKeyValueStoreDelete('users', 'user-1'));

    expect(action.payload).toEqual({ keyValueStoreName: 'users', key: 'user-1', sortKey: undefined, options: undefined });
  });
});
