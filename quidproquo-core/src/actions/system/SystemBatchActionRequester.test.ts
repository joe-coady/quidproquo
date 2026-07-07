import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { SystemActionType } from './SystemActionType';
import { askBatch } from './SystemBatchActionRequester';

describe('askBatch', () => {
  it('batches multiple actions into a single Batch action', () => {
    const actions = [
      { type: 'a', payload: 1 },
      { type: 'b', payload: 2 },
    ];

    const { action, returned } = captureRequester(askBatch(actions), ['ra', 'rb']);

    expect(action).toEqual({ type: SystemActionType.Batch, payload: { actions } });
    expect(returned).toEqual(['ra', 'rb']);
  });

  it('yields the single action directly when only one is given', () => {
    const inner = { type: 'a', payload: 1 };

    const { action } = captureRequester(askBatch([inner]), 'ra');

    expect(action).toEqual(inner);
  });

  it('wraps the single-action result in an array', () => {
    const { returned } = captureRequester(askBatch([{ type: 'a', payload: 1 }]), 'ra');

    expect(returned).toEqual(['ra']);
  });
});
