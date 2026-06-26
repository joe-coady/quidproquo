import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { askKeyValueStoreGet } from './KeyValueStoreGetActionRequester';

describe('askKeyValueStoreGet', () => {
  it('yields a Get action for the key', () => {
    const options = { consistentRead: true };

    const { action } = captureRequester(askKeyValueStoreGet('users', 'user-1', options));

    expect(action).toEqual({
      type: KeyValueStoreActionType.Get,
      payload: { keyValueStoreName: 'users', key: 'user-1', options },
    });
  });

  it('leaves options undefined when omitted', () => {
    const { action } = captureRequester(askKeyValueStoreGet('users', 'user-1'));

    expect(action.payload).toEqual({ keyValueStoreName: 'users', key: 'user-1', options: undefined });
  });

  it('returns the record the runtime resolves', () => {
    const { returned } = captureRequester(askKeyValueStoreGet('users', 'user-1'), { id: 'user-1' });

    expect(returned).toEqual({ id: 'user-1' });
  });
});
