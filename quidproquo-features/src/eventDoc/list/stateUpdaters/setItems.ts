import type { EventDocListSetItemsPayload } from '../effects/EventDocListSetItemsEffect';
import { clampEventDocListPage } from '../logic/clampEventDocListPage';
import type { EventDocListState } from '../types/EventDocListState';

// A fresh item set can shrink the list below the current page — keep the page
// in range so a refresh never strands the user on an empty page.
export const setItems = (state: EventDocListState, { items }: EventDocListSetItemsPayload): EventDocListState => ({
  ...state,
  items,
  page: clampEventDocListPage(state.page, items.length, state.pageSize),
});
