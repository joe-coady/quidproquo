import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { GuidActionType } from './GuidActionType';

// Payload
export interface GuidNewSortableManyActionPayload {
  count: number;
}

// Action
export interface GuidNewSortableManyAction extends Action<GuidNewSortableManyActionPayload> {
  type: GuidActionType.NewSortableMany;
  payload: GuidNewSortableManyActionPayload;
}

// Function Types
export type GuidNewSortableManyActionProcessor = ActionProcessor<GuidNewSortableManyAction, string[]>;
export type GuidNewSortableManyActionRequester = ActionRequester<GuidNewSortableManyAction, string[]>;
