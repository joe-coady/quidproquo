import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { SystemActionType } from './SystemActionType';
import { askGetRuntimeCorrelation } from './SystemGetRuntimeCorrelationActionRequester';

describe('askGetRuntimeCorrelation', () => {
  it('yields a GetRuntimeCorrelation action with no payload', () => {
    const { action } = captureRequester(askGetRuntimeCorrelation());

    expect(action).toEqual({ type: SystemActionType.GetRuntimeCorrelation });
  });

  it('returns the correlation guid the runtime resolves', () => {
    const { returned } = captureRequester(askGetRuntimeCorrelation(), 'module::abc-123');

    expect(returned).toBe('module::abc-123');
  });
});
