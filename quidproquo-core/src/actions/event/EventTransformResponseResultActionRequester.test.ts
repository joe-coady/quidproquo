import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { EventActionType } from './EventActionType';
import { askEventTransformResponseResult } from './EventTransformResponseResultActionRequester';

describe('askEventTransformResponseResult', () => {
  it('yields a TransformResponseResult action with the responses and collected params', () => {
    const responses = [{ success: true, result: { ok: 1 } }] as any;

    const { action } = captureRequester(askEventTransformResponseResult(responses, 'a', 'b'));

    expect(action).toEqual({
      type: EventActionType.TransformResponseResult,
      payload: { qpqEventRecordResponses: responses, eventParams: ['a', 'b'] },
    });
  });

  it('yields an empty eventParams array when none are given', () => {
    const responses = [] as any;

    const { action } = captureRequester(askEventTransformResponseResult(responses));

    expect(action).toEqual({
      type: EventActionType.TransformResponseResult,
      payload: { qpqEventRecordResponses: responses, eventParams: [] },
    });
  });

  it('returns the transformed response the runtime resolves', () => {
    const transformed = { statusCode: 200 };
    const { returned } = captureRequester(askEventTransformResponseResult([] as any), transformed);

    expect(returned).toBe(transformed);
  });
});
