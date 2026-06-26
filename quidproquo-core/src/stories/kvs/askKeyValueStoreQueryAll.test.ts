import { describe, expect, it, vi } from 'vitest';

import { KeyValueStoreActionType } from '../../actions/keyValueStore/KeyValueStoreActionType';
import { KeyValueStoreQueryAction } from '../../actions/keyValueStore/KeyValueStoreQueryActionTypes';
import { KvsQueryOperationType } from '../../actions/keyValueStore/types';
import { runStory } from '../../testing/storyTesting';
import { QpqPagedData } from '../../types';
import { askKeyValueStoreQueryAll } from './askKeyValueStoreQueryAll';

const keyCondition = { key: 'pk', operation: KvsQueryOperationType.Equal, valueA: 'tenant-1' };

describe('askKeyValueStoreQueryAll', () => {
  it('follows nextPageKey and concatenates every page', () => {
    const pages: Record<string, QpqPagedData<string>> = {
      first: { items: ['a', 'b'], nextPageKey: 'page-2' },
      'page-2': { items: ['c'] },
    };

    const result = runStory(askKeyValueStoreQueryAll('items', keyCondition), {
      [KeyValueStoreActionType.Query]: (action: KeyValueStoreQueryAction) => pages[action.payload.options?.nextPageKey ?? 'first'],
    });

    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('makes a single request when there is only one page', () => {
    const query = vi.fn(() => ({ items: ['only'] }));

    const result = runStory(askKeyValueStoreQueryAll('items', keyCondition), { [KeyValueStoreActionType.Query]: query });

    expect(result).toEqual(['only']);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('returns an empty array when the first page is empty', () => {
    const result = runStory(askKeyValueStoreQueryAll('items', keyCondition), { [KeyValueStoreActionType.Query]: { items: [] } });

    expect(result).toEqual([]);
  });
});
