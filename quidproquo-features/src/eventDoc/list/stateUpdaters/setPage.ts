import type { EventDocListSetPagePayload } from '../effects/EventDocListSetPageEffect';
import { clampEventDocListPage } from '../logic/clampEventDocListPage';
import type { EventDocListState } from '../types/EventDocListState';

export const setPage = (state: EventDocListState, { page }: EventDocListSetPagePayload): EventDocListState => ({
  ...state,
  page: clampEventDocListPage(page, state.items.length, state.pageSize),
});
