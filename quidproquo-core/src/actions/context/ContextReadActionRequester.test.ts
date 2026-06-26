import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { ContextActionType } from './ContextActionType';
import { askContextRead } from './ContextReadActionRequester';

describe('askContextRead', () => {
  it('yields a Read action with the supplied context identifier', () => {
    const contextIdentifier = { key: 'my-context' } as any;

    const { action } = captureRequester(askContextRead(contextIdentifier));

    expect(action).toEqual({
      type: ContextActionType.Read,
      payload: { contextIdentifier },
    });
  });

  it('returns the context value the runtime resolves', () => {
    const value = { userId: 'u1' };
    const { returned } = captureRequester(askContextRead({ key: 'my-context' } as any), value);

    expect(returned).toBe(value);
  });
});
