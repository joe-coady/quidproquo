import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { EventActionType } from './EventActionType';
import { askEventTransformEventRecord } from './EventTransformEventRecordActionRequester';

describe('askEventTransformEventRecord', () => {
  it('yields a TransformEventRecord action with the supplied record', () => {
    const eventRecord = { raw: 'payload' };

    const { action } = captureRequester(askEventTransformEventRecord(eventRecord));

    expect(action).toEqual({
      type: EventActionType.TransformEventRecord,
      payload: { eventRecord },
    });
  });

  it('returns the transformed record the runtime resolves', () => {
    const transformed = { id: 'qpq' };
    const { returned } = captureRequester(askEventTransformEventRecord({ raw: 'payload' }), transformed);

    expect(returned).toBe(transformed);
  });
});
