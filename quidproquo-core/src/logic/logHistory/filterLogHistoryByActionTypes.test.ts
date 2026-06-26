import { describe, expect, it } from 'vitest';

import { SystemActionType } from '../../actions';
import { ActionHistory } from '../../types';
import { filterLogHistoryByActionTypes } from './filterLogHistoryByActionTypes';

const entry = (type: string): ActionHistory<any> => ({
  act: { type },
  res: [undefined],
  startedAt: '2024-01-01T00:00:00.000Z',
  finishedAt: '2024-01-01T00:00:01.000Z',
});

describe('filterLogHistoryByActionTypes', () => {
  it('keeps only entries whose action type is requested', () => {
    const history = [entry('Date/Now'), entry('Guid/New'), entry('Date/Now')];

    const result = filterLogHistoryByActionTypes(history, ['Date/Now']);

    expect(result.map((e) => e.act.type)).toEqual(['Date/Now', 'Date/Now']);
  });

  it('returns everything when no types are given', () => {
    const history = [entry('Date/Now'), entry('Guid/New')];

    expect(filterLogHistoryByActionTypes(history, [])).toHaveLength(2);
  });

  it('flattens batch actions into their nested actions before filtering', () => {
    const batch: ActionHistory<any> = {
      act: { type: SystemActionType.Batch, payload: { actions: [{ type: 'Date/Now' }, { type: 'Guid/New' }] } },
      res: [undefined],
      startedAt: '2024-01-01T00:00:00.000Z',
      finishedAt: '2024-01-01T00:00:01.000Z',
    };

    const result = filterLogHistoryByActionTypes([batch], ['Guid/New']);

    expect(result.map((e) => e.act.type)).toEqual(['Guid/New']);
  });
});
