import { askCatch, AskResponse, askThrowError, createDynamicFunctionCaller } from 'quidproquo-core';

import { eventDocFunctionsName } from '../constants/eventDocFunctionsName';
import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocInvokableFunctions } from '../definition/types/EventDocInvokableFunctions';
import { EventDocLink } from '../models';
import { askEventDocDocumentStateLatest } from './askEventDocDocumentStateLatest';
import { isEventDocFunctionsMissing } from './isEventDocFunctionsMissing';

/**
 * Every doc the CURRENT document depends on, ONE hop out: fold the state snapshot-seeded
 * and hand it to the `collectReferencesFromState` member of the collection's registered
 * EventDocFunctions object — no log walk. This is the references ROUTE's read: what the
 * document references now. The full-history walk (every link ANY historical state ever
 * held — askEventDocReferences) belongs to the transfer export, which exports the whole
 * log and must chase links from all of it.
 *
 * A collection with no registered object (definition-less) is a leaf and returns [];
 * so is a doc with no events.
 */
export function* askEventDocReferencesFromState(docId: string): AskResponse<EventDocLink[]> {
  const { storeName, type } = yield* askEventDocResolveStore();

  const functionsCaller = createDynamicFunctionCaller<EventDocInvokableFunctions>(eventDocFunctionsName(storeName, type));

  const stateAtHead = yield* askCatch(askEventDocDocumentStateLatest(docId));

  if (!stateAtHead.success) {
    if (isEventDocFunctionsMissing(stateAtHead.error.errorType)) {
      return [];
    }

    return yield* askThrowError(stateAtHead.error.errorType, stateAtHead.error.errorText);
  }

  if (!stateAtHead.result) {
    return [];
  }

  const collected = yield* askCatch(functionsCaller.collectReferencesFromState(stateAtHead.result.state));

  if (!collected.success) {
    if (isEventDocFunctionsMissing(collected.error.errorType)) {
      return [];
    }

    return yield* askThrowError(collected.error.errorType, collected.error.errorText);
  }

  return collected.result;
}
