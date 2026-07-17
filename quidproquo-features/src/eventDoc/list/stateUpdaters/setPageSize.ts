import type { EventDocListSetPageSizePayload } from '../effects/EventDocListSetPageSizeEffect';
import { clampEventDocListPage } from '../logic/clampEventDocListPage';
import type { EventDocListState } from '../types/EventDocListState';

// The view dispatches the measured rows-per-viewport. A shrinking page size
// can push the current page past the end, so the page is re-clamped with it.
export const setPageSize = (state: EventDocListState, { pageSize }: EventDocListSetPageSizePayload): EventDocListState => {
  const nextPageSize = Math.max(1, Math.floor(pageSize));

  if (nextPageSize === state.pageSize) {
    return state;
  }

  return {
    ...state,
    pageSize: nextPageSize,
    page: clampEventDocListPage(state.page, state.items.length, nextPageSize),
  };
};
