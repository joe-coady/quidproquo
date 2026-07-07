import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { askKeyValueStoreQuery } from './KeyValueStoreQueryActionRequester';

describe('askKeyValueStoreQuery', () => {
  it('yields a Query action with the key condition and options', () => {
    const keyCondition = { field: 'pk', operation: 'equals', value: 'group-1' } as any;
    const options = { limit: 10 };

    const { action } = captureRequester(askKeyValueStoreQuery('users', keyCondition, options));

    expect(action).toEqual({
      type: KeyValueStoreActionType.Query,
      payload: { keyValueStoreName: 'users', keyCondition, options },
    });
  });

  it('leaves options undefined when omitted', () => {
    const keyCondition = { field: 'pk', operation: 'equals', value: 'group-1' } as any;

    const { action } = captureRequester(askKeyValueStoreQuery('users', keyCondition));

    expect(action.payload).toEqual({ keyValueStoreName: 'users', keyCondition, options: undefined });
  });

  it('returns the matched items the runtime resolves', () => {
    const keyCondition = { field: 'pk', operation: 'equals', value: 'group-1' } as any;
    const items = [{ id: 'a' }];

    const { returned } = captureRequester(askKeyValueStoreQuery('users', keyCondition), items);

    expect(returned).toEqual(items);
  });
});
