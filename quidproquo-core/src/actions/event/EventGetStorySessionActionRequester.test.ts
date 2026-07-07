import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { EventActionType } from './EventActionType';
import { askEventGetStorySession } from './EventGetStorySessionActionRequester';

describe('askEventGetStorySession', () => {
  it('yields a GetStorySession action with params, record and match result', () => {
    const eventParams = ['a', 'b'];
    const record = { id: 'r1' };
    const matchResult = { matched: true } as any;

    const { action } = captureRequester(askEventGetStorySession(eventParams, record, matchResult));

    expect(action).toEqual({
      type: EventActionType.GetStorySession,
      payload: { eventParams, qpqEventRecord: record, matchStoryResult: matchResult },
    });
  });

  it('returns the session the runtime resolves', () => {
    const session = { sessionId: 's1' };
    const { returned } = captureRequester(askEventGetStorySession(['a'], { id: 'r1' }, { matched: true } as any), session);

    expect(returned).toBe(session);
  });
});
