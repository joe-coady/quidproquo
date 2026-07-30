import type { EventDocListPageLoadedPayload } from '../effects/EventDocListPageLoadedEffect';
import type { EventDocListState } from '../types/EventDocListState';

// Replace the current page's rows and record whether another page follows.
//
// A straight replace, not a merge: `items` is one page, and the walk's position lives in `pageIndex`.
export const pageLoaded = (state: EventDocListState, { items, nextPageKey }: EventDocListPageLoadedPayload): EventDocListState => ({
  ...state,
  items,
  nextPageKey,
});
