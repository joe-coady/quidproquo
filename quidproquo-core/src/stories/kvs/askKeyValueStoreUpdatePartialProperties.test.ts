import { describe, expect, it, vi } from 'vitest';

import { KeyValueStoreActionType } from '../../actions/keyValueStore/KeyValueStoreActionType';
import { KeyValueStoreUpdateAction } from '../../actions/keyValueStore/KeyValueStoreUpdateActionTypes';
import { KvsUpdateActionType } from '../../actions/keyValueStore/types';
import { runStory } from '../../testing/storyTesting';
import { askKeyValueStoreUpdatePartialProperties } from './askKeyValueStoreUpdatePartialProperties';

interface Widget {
  id: string;
  name: string;
  count: number;
  note?: string;
}

describe('askKeyValueStoreUpdatePartialProperties', () => {
  it('sets valid properties, removes undefined ones, and skips the partition key', () => {
    const update = vi.fn((action: KeyValueStoreUpdateAction<Widget>) => action.payload);

    const result = runStory(
      askKeyValueStoreUpdatePartialProperties<Widget, 'id'>('widgets', 'id', { id: 'w1', name: 'gear', count: 5, note: undefined }),
      { [KeyValueStoreActionType.Update]: update },
    );

    const payload = update.mock.calls[0][0].payload;
    expect(payload.key).toBe('w1');
    expect(payload.sortKey).toBeUndefined();
    expect(payload.updates).toEqual([
      { attributePath: 'name', action: KvsUpdateActionType.Set, value: 'gear' },
      { attributePath: 'count', action: KvsUpdateActionType.Set, value: 5 },
      { attributePath: 'note', action: KvsUpdateActionType.Remove },
    ]);
    expect(result).toBe(payload);
  });

  it('excludes the sort key from the update operations and passes it through', () => {
    const update = vi.fn((action: KeyValueStoreUpdateAction<Widget>) => action.payload);

    runStory(askKeyValueStoreUpdatePartialProperties<Widget, 'id', 'name'>('widgets', 'id', { id: 'w1', name: 'gear', count: 9 }, 'name'), {
      [KeyValueStoreActionType.Update]: update,
    });

    const payload = update.mock.calls[0][0].payload;
    expect(payload.key).toBe('w1');
    expect(payload.sortKey).toBe('gear');
    expect(payload.updates).toEqual([{ attributePath: 'count', action: KvsUpdateActionType.Set, value: 9 }]);
  });
});
