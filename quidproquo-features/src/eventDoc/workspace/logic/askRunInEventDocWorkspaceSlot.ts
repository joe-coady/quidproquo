import { askOverrideActions, AskResponse, AskResponseReturnType, getSuccessfulEitherActionResultIfRequired } from 'quidproquo-core';

import { EventDocActionType, EventDocApplyEventAction } from '../../actions';
import { EventDocWorkspaceSlotBinding } from '../types/EventDocWorkspaceSlotBinding';
import { askEventDocWorkspaceCommitEvent } from './askEventDocWorkspaceCommitEvent';

// The ApplyEvent handler for one slot binding. It CONSUMES the action (running the
// commit story in its place) so nothing re-bubbles: an outer bind never sees an inner
// bind's commits, meaning innermost wins with zero extra logic.
const getApplyEventOverride = (binding: EventDocWorkspaceSlotBinding) =>
  function* overrideApplyEvent(action: EventDocApplyEventAction): AskResponse<unknown> {
    // Action payloads are optional at the type level only; the requester always builds
    // one, so a missing payload is a malformed action and safe to ignore.
    if (action.payload) {
      yield* askEventDocWorkspaceCommitEvent(binding, action.payload);
    }

    // We produce the (void) result ourselves, so shape it for returnErrors.
    return getSuccessfulEitherActionResultIfRequired(undefined, action.returnErrors);
  };

// Run one story with every askApplyEventDocEvent it yields (however deeply nested)
// routed into the bound slot. This is the workspace's inline interpreter for the
// ApplyEvent action: the same askOverrideActions pattern as askContextProvideValue and
// askReduceState. Batches (askRunParallel) are cracked recursively by
// askOverrideActions, so parallel edits route correctly.
export function* askRunInEventDocWorkspaceSlot<T extends AskResponse<any>>(
  binding: EventDocWorkspaceSlotBinding,
  storyIterator: T,
): AskResponse<AskResponseReturnType<T>> {
  return yield* askOverrideActions(storyIterator, {
    [EventDocActionType.ApplyEvent]: getApplyEventOverride(binding),
  });
}
