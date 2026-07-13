import { ContextActionType, KeyValueStoreActionType, runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { askProcessOnDisconnect } from './askProcessOnDisconnect';

describe('askProcessOnDisconnect', () => {
  it('deletes the connection record from the store', () => {
    let captured: any;

    runStory(askProcessOnDisconnect('c1'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [KeyValueStoreActionType.Delete]: (action: any) => {
        captured = action;
        return undefined;
      },
    });

    expect(captured.payload.keyValueStoreName).toBe('qpq-wsq-demo');
    expect(captured.payload.key).toBe('c1');
  });
});
