import { ContextActionType, KeyValueStoreActionType, runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { askProcessOnConnect } from './askProcessOnConnect';

describe('askProcessOnConnect', () => {
  it('upserts a new connection record into the store', () => {
    let captured: any;

    runStory(askProcessOnConnect('c1', '2026-06-26', 1234, '1.1.1.1'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [KeyValueStoreActionType.Upsert]: (action: any) => {
        captured = action;
        return undefined;
      },
    });

    expect(captured.payload.keyValueStoreName).toBe('qpq-wsq-demo');
    expect(captured.payload.item).toEqual({
      id: 'c1',
      requestTime: '2026-06-26',
      requestTimeEpoch: 1234,
      ip: '1.1.1.1',
    });
  });
});
