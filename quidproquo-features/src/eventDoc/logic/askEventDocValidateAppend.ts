import { askCatch, AskResponse, askThrowError, createDynamicFunctionCaller, ErrorTypeEnum } from 'quidproquo-core';

import { eventDocFunctionsName } from '../constants/eventDocFunctionsName';
import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocInvokableFunctions } from '../definition/types/EventDocInvokableFunctions';
import { EventDocEvent } from '../models';
import { askEventDocDocumentStateLatest } from './askEventDocDocumentStateLatest';
import { isEventDocFunctionsMissing } from './isEventDocFunctionsMissing';

/**
 * The append path's pre-write gate: run the collection's registered `validateEvent`
 * against the document's current state and throw Invalid on a rejection, so the event
 * never enters the log. State resolves snapshot-seeded with a CONSISTENT event read (the
 * gate must see the writer's own just-landed appends — a draft-guard CreateDraft followed
 * immediately by the edit it unblocks).
 *
 * A collection with no registered functions object — or one whose definition predates
 * `validateEvent` — skips the gate entirely (functions-missing), preserving write-and-go.
 * A doc with no state yet (its very first event) validates against no state only through
 * the registered validator's own tolerance: the resolver returns null state for an empty
 * log, and the gate skips — the INIT event has nothing to be validated against.
 */
export function* askEventDocValidateAppend(modelId: string, event: EventDocEvent): AskResponse<void> {
  const { storeName, type } = yield* askEventDocResolveStore();
  const functionsCaller = createDynamicFunctionCaller<EventDocInvokableFunctions>(eventDocFunctionsName(storeName, type));

  const stateAtHead = yield* askCatch(askEventDocDocumentStateLatest(modelId, { consistentRead: true }));

  if (!stateAtHead.success) {
    if (isEventDocFunctionsMissing(stateAtHead.error.errorType)) {
      return;
    }

    return yield* askThrowError(stateAtHead.error.errorType, stateAtHead.error.errorText);
  }

  if (!stateAtHead.result) {
    return;
  }

  const verdict = yield* askCatch(functionsCaller.validateEvent(event, stateAtHead.result.state));

  if (!verdict.success) {
    if (isEventDocFunctionsMissing(verdict.error.errorType)) {
      return;
    }

    return yield* askThrowError(verdict.error.errorType, verdict.error.errorText);
  }

  if (verdict.result) {
    return yield* askThrowError(ErrorTypeEnum.Invalid, verdict.result);
  }
}
