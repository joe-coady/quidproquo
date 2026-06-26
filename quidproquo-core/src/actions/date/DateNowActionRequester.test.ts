import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { DateActionType } from './DateActionType';
import { askDateNow } from './DateNowActionRequester';

describe('askDateNow', () => {
  it('yields a Now action', () => {
    const { action } = captureRequester(askDateNow());

    expect(action).toEqual({ type: DateActionType.Now });
  });

  it('returns the timestamp the runtime resolves', () => {
    const { returned } = captureRequester(askDateNow(), '2026-06-26T00:00:00.000Z');

    expect(returned).toBe('2026-06-26T00:00:00.000Z');
  });
});
