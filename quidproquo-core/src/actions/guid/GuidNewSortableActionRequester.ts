import { GuidActionType } from './GuidActionType';
import { GuidNewSortableActionRequester } from './GuidNewSortableActionRequesterTypes';

export function* askNewSortableGuid(): GuidNewSortableActionRequester {
  return yield { type: GuidActionType.NewSortable };
}
