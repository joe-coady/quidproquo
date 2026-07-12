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

  it('forwards the options (including scope) on every paginated scan', () => {
    const scopes: string[] = [];
    const pages: Record<string, QpqPagedData<number>> = {
      start: { items: [1], nextPageKey: 'next' },
      next: { items: [2] },
    };

    // Record the scope of each page request so we can prove none of them dropped it
    const scanRecordingScope = (action: KeyValueStoreScanAction) => {
      scopes.push(action.payload.options?.scope ?? '(none)');
      return pages[action.payload.nextPageKey ?? 'start'];
    };

    const result = runStory(askKeyValueStoreScanAll('items', undefined, { scope: 'tenant-a' }), {
      [KeyValueStoreActionType.Scan]: scanRecordingScope,
    });

    expect(result).toEqual([1, 2]);
    expect(scopes).toEqual(['tenant-a', 'tenant-a']);
  });
});
