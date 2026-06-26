import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { EventActionType } from './EventActionType';
import { askEventMatchStory } from './EventMatchStoryActionRequester';

describe('askEventMatchStory', () => {
  it('yields a MatchStory action with the record and event params', () => {
    const record = { id: 'r1' };
    const eventParams = ['a', 'b'];

    const { action } = captureRequester(askEventMatchStory(record, eventParams));

    expect(action).toEqual({
      type: EventActionType.MatchStory,
      payload: { qpqEventRecord: record, eventParams },
    });
  });

  it('returns the match result the runtime resolves', () => {
    const matchResult = { matched: true } as any;
    const { returned } = captureRequester(askEventMatchStory({ id: 'r1' }, []), matchResult);

    expect(returned).toBe(matchResult);
  });
});
