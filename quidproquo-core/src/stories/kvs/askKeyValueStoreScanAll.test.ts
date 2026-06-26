import { describe, expect, it } from 'vitest';

import { KeyValueStoreActionType } from '../../actions/keyValueStore/KeyValueStoreActionType';
import { KeyValueStoreScanAction } from '../../actions/keyValueStore/KeyValueStoreScanActionTypes';
import { runStory } from '../../testing/storyTesting';
import { QpqPagedData } from '../../types';
import { askKeyValueStoreScanAll } from './askKeyValueStoreScanAll';

describe('askKeyValueStoreScanAll', () => {
  it('pages through the whole store using nextPageKey', () => {
    const pages: Record<string, QpqPagedData<number>> = {
      start: { items: [1, 2], nextPageKey: 'next' },
      next: { items: [3] },
    };

    const result = runStory(askKeyValueStoreScanAll('items'), {
      [KeyValueStoreActionType.Scan]: (action: KeyValueStoreScanAction) => pages[action.payload.nextPageKey ?? 'start'],
    });

    expect(result).toEqual([1, 2, 3]);
  });

  it('returns an empty array for an empty store', () => {
    const result = runStory(askKeyValueStoreScanAll('items'), { [KeyValueStoreActionType.Scan]: { items: [] } });

    expect(result).toEqual([]);
  });
});
