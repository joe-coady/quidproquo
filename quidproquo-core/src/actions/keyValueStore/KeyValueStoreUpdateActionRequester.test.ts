import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { askKeyValueStoreUpdate } from './KeyValueStoreUpdateActionRequester';

describe('askKeyValueStoreUpdate', () => {
  it('yields an Update action with updates, key, sort key and options', () => {
    const updates = { set: { name: 'new' } } as any;
    const options = { consistentRead: true };

    const { action } = captureRequester(askKeyValueStoreUpdate('users', updates, 'user-1', 'sort-1', options));

    expect(action).toEqual({
      type: KeyValueStoreActionType.Update,
      payload: { keyValueStoreName: 'users', key: 'user-1', sortKey: 'sort-1', updates, options },
    });
  });

  it('leaves sort key and options undefined when omitted', () => {
    const updates = { set: { name: 'new' } } as any;

    const { action } = captureRequester(askKeyValueStoreUpdate('users', updates, 'user-1'));

    expect(action.payload).toEqual({ keyValueStoreName: 'users', key: 'user-1', sortKey: undefined, updates, options: undefined });
  });

  it('returns the updated record the runtime resolves', () => {
    const updates = { set: { name: 'new' } } as any;

    const { returned } = captureRequester(askKeyValueStoreUpdate('users', updates, 'user-1'), { id: 'user-1', name: 'new' });

    expect(returned).toEqual({ id: 'user-1', name: 'new' });
  });
});
