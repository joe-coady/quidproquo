import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { EventActionType } from './EventActionType';
import { askEventResolveCaughtError } from './EventResolveCaughtErrorActionRequester';

describe('askEventResolveCaughtError', () => {
  it('yields a ResolveCaughtError action with the supplied error', () => {
    const error = { errorType: 'GenericError', errorText: 'boom' } as any;

    const { action } = captureRequester(askEventResolveCaughtError(error));

    expect(action).toEqual({
      type: EventActionType.ResolveCaughtError,
      payload: { error },
    });
  });

  it('returns the transformed params the runtime resolves', () => {
    const resolved = { handled: true };
    const { returned } = captureRequester(askEventResolveCaughtError({ errorType: 'GenericError' } as any), resolved);

    expect(returned).toBe(resolved);
  });
});
