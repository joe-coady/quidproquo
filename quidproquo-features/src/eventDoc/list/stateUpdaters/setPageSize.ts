import type { EventDocListSetPageSizePayload } from '../effects/EventDocListSetPageSizeEffect';
import type { EventDocListState } from '../types/EventDocListState';

// The view dispatches the measured rows-per-viewport.
//
// Changing it RESTARTS the walk: every recorded cursor was produced under the old page size, so continuing
// with them would skip or repeat rows. Resetting to the first page is the only correct response — the caller
// reloads after this.
export const setPageSize = (state: EventDocListState, { pageSize }: EventDocListSetPageSizePayload): EventDocListState => {
  const nextPageSize = Math.max(1, Math.floor(pageSize));

  if (nextPageSize === state.pageSize) {
    return state;
  }

  return {
    ...state,
    pageSize: nextPageSize,
    pageIndex: 0,
    cursors: [null],
    nextPageKey: null,
  };
};
