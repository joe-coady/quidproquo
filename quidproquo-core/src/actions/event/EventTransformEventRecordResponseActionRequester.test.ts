import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { EventActionType } from './EventActionType';
import { askEventTransformEventRecord } from './EventTransformEventRecordResponseActionRequester';

describe('askEventTransformEventRecord (response)', () => {
  it('yields a TransformEventRecord action with the supplied record', () => {
    const eventRecord = { raw: 'response' };

    const { action } = captureRequester(askEventTransformEventRecord(eventRecord));

    expect(action).toEqual({
      type: EventActionType.TransformEventRecord,
      payload: { eventRecord },
    });
  });

  it('returns the transformed record the runtime resolves', () => {
    const transformed = { id: 'qpq' };
    const { returned } = captureRequester(askEventTransformEventRecord({ raw: 'response' }), transformed);

    expect(returned).toBe(transformed);
  });
});
