import type { EventDocListSetPageIndexPayload } from '../effects/EventDocListSetPageIndexEffect';
import type { EventDocListState } from '../types/EventDocListState';

// Move the walk, remembering the cursor that reaches this page.
//
// The cursor is stored at its page's index so Previous can re-fetch a page already walked past — a cursor
// only ever points forward, so without this record there is no way back.
export const setPageIndex = (state: EventDocListState, { pageIndex, cursor }: EventDocListSetPageIndexPayload): EventDocListState => {
  const cursors = [...state.cursors];
  cursors[pageIndex] = cursor;

  return { ...state, pageIndex, cursors };
};
