import { GuidActionType } from './GuidActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';

// Payload
export interface GuidNewSortableActionPayload {}

// Action
export interface GuidNewSortableAction extends Action<GuidNewSortableActionPayload> {
  type: GuidActionType.NewSortable;
}

// Function Types
export type GuidNewSortableActionProcessor = ActionProcessor<GuidNewSortableAction, string>;
export type GuidNewSortableActionRequester = ActionRequester<GuidNewSortableAction, string>;
