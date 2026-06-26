import { describe, expect, it, vi } from 'vitest';

import { KeyValueStoreActionType } from '../../actions/keyValueStore/KeyValueStoreActionType';
import { KvsQueryOperationType } from '../../actions/keyValueStore/types';
import { runStory } from '../../testing/storyTesting';
import { askKeyValueStoreQuerySingle } from './askKeyValueStoreQuerySingle';

const keyCondition = { key: 'pk', operation: KvsQueryOperationType.Equal, valueA: 'tenant-1' };

describe('askKeyValueStoreQuerySingle', () => {
  it('returns the first item from the page', () => {
    const result = runStory(askKeyValueStoreQuerySingle<string>('items', keyCondition), {
      [KeyValueStoreActionType.Query]: { items: ['first', 'second'] },
    });

    expect(result).toBe('first');
  });

  it('returns null when no items are found', () => {
    const result = runStory(askKeyValueStoreQuerySingle<string>('items', keyCondition), {
      [KeyValueStoreActionType.Query]: { items: [] },
    });

    expect(result).toBeNull();
  });

  it('makes a single query when the limit is reached', () => {
    const query = vi.fn(() => ({ items: ['only'] }));

    const result = runStory(askKeyValueStoreQuerySingle<string>('items', keyCondition), { [KeyValueStoreActionType.Query]: query });

    expect(result).toBe('only');
    expect(query).toHaveBeenCalledTimes(1);
  });
});
