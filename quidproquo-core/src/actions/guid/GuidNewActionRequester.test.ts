import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { GuidActionType } from './GuidActionType';
import { askNewGuid } from './GuidNewActionRequester';

describe('askNewGuid', () => {
  it('yields a New action', () => {
    const { action } = captureRequester(askNewGuid());

    expect(action).toEqual({ type: GuidActionType.New });
  });

  it('returns the guid the runtime resolves', () => {
    const { returned } = captureRequester(askNewGuid(), 'abc-123');

    expect(returned).toBe('abc-123');
  });
});
