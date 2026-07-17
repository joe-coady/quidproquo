import type { EventDocListAddItemPayload } from '../effects/EventDocListAddItemEffect';
import type { EventDocListState } from '../types/EventDocListState';

// Prepends a newly created item — the list is newest-first (updatedAt desc).
export const addItem = (state: EventDocListState, { item }: EventDocListAddItemPayload): EventDocListState => ({
  ...state,
  items: [item, ...state.items],
});
