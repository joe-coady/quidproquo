import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { StateActionType } from './StateActionType';
import { askStateDispatch } from './StateDispatchActionRequester';

describe('askStateDispatch', () => {
  it('yields a Dispatch action wrapping the dispatched action', () => {
    const dispatched = { type: 'increment', amount: 1 };

    const { action } = captureRequester(askStateDispatch(dispatched));

    expect(action).toEqual({ type: StateActionType.Dispatch, payload: { action: dispatched } });
  });
});
