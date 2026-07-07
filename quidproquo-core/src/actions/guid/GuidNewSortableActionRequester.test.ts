import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { GuidActionType } from './GuidActionType';
import { askNewSortableGuid } from './GuidNewSortableActionRequester';

describe('askNewSortableGuid', () => {
  it('yields a NewSortable action', () => {
    const { action } = captureRequester(askNewSortableGuid());

    expect(action).toEqual({ type: GuidActionType.NewSortable });
  });

  it('returns the sortable guid the runtime resolves', () => {
    const { returned } = captureRequester(askNewSortableGuid(), '01-sortable');

    expect(returned).toBe('01-sortable');
  });
});
