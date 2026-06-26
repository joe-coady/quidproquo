import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { askKeyValueStoreUpsert } from './KeyValueStoreUpsertActionRequester';

describe('askKeyValueStoreUpsert', () => {
  it('yields an Upsert action with the item and options', () => {
    const item = { id: 'user-1', name: 'Ada' };
    const options = { ttlInSeconds: 3600 };

    const { action } = captureRequester(askKeyValueStoreUpsert('users', item, options));

    expect(action).toEqual({
      type: KeyValueStoreActionType.Upsert,
      payload: { keyValueStoreName: 'users', item, options },
    });
  });

  it('leaves options undefined when omitted', () => {
    const item = { id: 'user-1', name: 'Ada' };

    const { action } = captureRequester(askKeyValueStoreUpsert('users', item));

    expect(action.payload).toEqual({ keyValueStoreName: 'users', item, options: undefined });
  });

  it('returns the upserted item the runtime resolves', () => {
    const item = { id: 'user-1', name: 'Ada' };

    const { returned } = captureRequester(askKeyValueStoreUpsert('users', item), item);

    expect(returned).toEqual(item);
  });
});
