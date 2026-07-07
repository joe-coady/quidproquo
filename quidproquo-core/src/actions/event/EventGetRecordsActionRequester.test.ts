import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { EventActionType } from './EventActionType';
import { askEventGetRecords } from './EventGetRecordsActionRequester';

describe('askEventGetRecords', () => {
  it('yields a GetRecords action with the collected event params', () => {
    const { action } = captureRequester(askEventGetRecords('a', 'b', 'c'));

    expect(action).toEqual({
      type: EventActionType.GetRecords,
      payload: { eventParams: ['a', 'b', 'c'] },
    });
  });

  it('yields an empty eventParams array when none are given', () => {
    const { action } = captureRequester(askEventGetRecords());

    expect(action).toEqual({
      type: EventActionType.GetRecords,
      payload: { eventParams: [] },
    });
  });

  it('returns the records the runtime resolves', () => {
    const records = [{ id: 1 }, { id: 2 }];
    const { returned } = captureRequester(askEventGetRecords('x'), records);

    expect(returned).toBe(records);
  });
});
