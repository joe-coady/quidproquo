import { askOverrideActions, AskResponse, AskResponseReturnType, getSuccessfulEitherActionResultIfRequired } from 'quidproquo-core';

import {
  EventDocActionType,
  EventDocApplyEventAction,
  EventDocApplyTransientEventAction,
  EventDocReadIdentityAction,
  EventDocReadStateAction,
} from '../../actions';
import { EventDocWorkspaceSlotBinding } from '../types/EventDocWorkspaceSlotBinding';
import { askEventDocWorkspaceCommitEvent } from './askEventDocWorkspaceCommitEvent';
import { askEventDocWorkspaceCommitTransientEvent } from './askEventDocWorkspaceCommitTransientEvent';
import { askEventDocWorkspaceReadState } from './askEventDocWorkspaceReadState';

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

// Same consume-and-answer-void pattern for the transient sibling: the commit lands in
// the bound slot's transient group under the action's transientKey.
const getApplyTransientEventOverride = (binding: EventDocWorkspaceSlotBinding) =>
  function* overrideApplyTransientEvent(action: EventDocApplyTransientEventAction): AskResponse<unknown> {
    // Action payloads are optional at the type level only; the requester always builds
    // one, so a missing payload is a malformed action and safe to ignore.
    if (action.payload) {
      yield* askEventDocWorkspaceCommitTransientEvent(binding, action.payload);
    }

    // We produce the (void) result ourselves, so shape it for returnErrors.
    return getSuccessfulEitherActionResultIfRequired(undefined, action.returnErrors);
  };

// Answers askEventDocReadState with the bound slot's current folded view. Read AFTER
// any commit earlier in the same story: the ApplyEvent override dispatches into
// runtime state before returning and the view selector folds the pending tail, so
// read-your-own-writes holds within a story.
const getReadStateOverride = (binding: EventDocWorkspaceSlotBinding) =>
  function* overrideReadState(action: EventDocReadStateAction): AskResponse<unknown> {
    const state = yield* askEventDocWorkspaceReadState();

    // We produce the view ourselves, so shape it for returnErrors.
    return getSuccessfulEitherActionResultIfRequired(binding.getView(state), action.returnErrors);
  };

// Answers askEventDocReadIdentity with the bound slot's document identity (null until
// the workspace initialises the slot; always null for unsaved docs).
const getReadIdentityOverride = (binding: EventDocWorkspaceSlotBinding) =>
  function* overrideReadIdentity(action: EventDocReadIdentityAction): AskResponse<unknown> {
    const state = yield* askEventDocWorkspaceReadState();

    // We produce the identity ourselves, so shape it for returnErrors.
    return getSuccessfulEitherActionResultIfRequired(state.slots[binding.slotKey]?.documentIdentity ?? null, action.returnErrors);
  };

// Run one story with every askApplyEventDocEvent (and askApplyTransientEventDocEvent /
// askEventDocReadState / askEventDocReadIdentity) it yields (however deeply nested) routed into the bound slot.
// This is the workspace's inline interpreter for the eventDoc actions: the same
// askOverrideActions pattern as askContextProvideValue and askReduceState. Batches
// (askRunParallel) are cracked recursively by askOverrideActions, so parallel edits
// route correctly.
export function* askRunInEventDocWorkspaceSlot<T extends AskResponse<any>>(
  binding: EventDocWorkspaceSlotBinding,
  storyIterator: T,
): AskResponse<AskResponseReturnType<T>> {
  return yield* askOverrideActions(storyIterator, {
    [EventDocActionType.ApplyEvent]: getApplyEventOverride(binding),
    [EventDocActionType.ApplyTransientEvent]: getApplyTransientEventOverride(binding),
    [EventDocActionType.ReadState]: getReadStateOverride(binding),
    [EventDocActionType.ReadIdentity]: getReadIdentityOverride(binding),
  });
}
