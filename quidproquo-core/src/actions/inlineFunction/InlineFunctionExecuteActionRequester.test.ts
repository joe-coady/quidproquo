import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { InlineFunctionActionType } from './InlineFunctionActionType';
import { askInlineFunctionExecute } from './InlineFunctionExecuteActionRequester';

describe('askInlineFunctionExecute', () => {
  it('yields an Execute action with the function name and payload', () => {
    const payload = { a: 1, b: 2 };

    const { action } = captureRequester(askInlineFunctionExecute('doThing', payload));

    expect(action).toEqual({
      type: InlineFunctionActionType.Execute,
      payload: {
        functionName: 'doThing',
        payload,
      },
    });
  });

  it('returns the result the runtime resolves', () => {
    const result = { sum: 3 };
    const { returned } = captureRequester(askInlineFunctionExecute('doThing', { a: 1, b: 2 }), result);

    expect(returned).toBe(result);
  });
});
