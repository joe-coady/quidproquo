import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { MathActionType } from './MathActionType';
import { askRandomNumber } from './MathRandomNumberActionRequester';

describe('askRandomNumber', () => {
  it('yields a RandomNumber action', () => {
    const { action } = captureRequester(askRandomNumber());

    expect(action).toEqual({ type: MathActionType.RandomNumber });
  });

  it('returns the number the runtime resolves', () => {
    const { returned } = captureRequester(askRandomNumber(), 0.42);

    expect(returned).toBe(0.42);
  });
});
