import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { EventActionType } from './EventActionType';
import { askEventTransformEventParams } from './EventTransformEventParamsActionRequester';

describe('askEventTransformEventParams', () => {
  it('yields a TransformEventParams action with the collected params', () => {
    const { action } = captureRequester(askEventTransformEventParams('a', 'b'));

    expect(action).toEqual({
      type: EventActionType.TransformEventParams,
      payload: { eventParams: ['a', 'b'] },
    });
  });

  it('yields an empty eventParams array when none are given', () => {
    const { action } = captureRequester(askEventTransformEventParams());

    expect(action).toEqual({
      type: EventActionType.TransformEventParams,
      payload: { eventParams: [] },
    });
  });

  it('returns the transformed params the runtime resolves', () => {
    const transformed = { ok: true };
    const { returned } = captureRequester(askEventTransformEventParams('a'), transformed);

    expect(returned).toBe(transformed);
  });
});
