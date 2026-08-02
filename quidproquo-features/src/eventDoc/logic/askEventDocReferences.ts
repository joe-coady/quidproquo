import { askCatch, AskResponse, askThrowError, createDynamicFunctionCaller } from 'quidproquo-core';

import { eventDocFunctionsName } from '../constants/eventDocFunctionsName';
import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { askEventDocEventListAll } from '../data/askEventDocEventListAll';
import { EventDocInvokableFunctions } from '../definition/types/EventDocInvokableFunctions';
import { EventDocLink } from '../models';
import { isEventDocFunctionsMissing } from './isEventDocFunctionsMissing';

/**
 * Every doc this one has EVER depended on, ONE hop out, across its whole history: hand the
 * whole log to the `collectReferences` member of the collection's registered
 * EventDocFunctions object and let it walk it (see collectEventDocReferences - it collects
 * at every step, migrated to the latest shape, so a link that existed only in an older
 * version is still found). O(log length) by design — this is the TRANSFER EXPORT's read,
 * which exports the whole history and must chase links from all of it. The references
 * route uses askEventDocReferencesFromState (current state only) instead. A collection
 * with no registered object (definition-less) is a leaf and returns []; whether it is one
 * only surfaces after the call, so the log read happens either way.
 *
 * The recursive walk over these edges lives in the transfer feature (askEventDocManifest),
 * which is the layer that knows every collection.
 */
export function* askEventDocReferences(docId: string): AskResponse<EventDocLink[]> {
  const { storeName, type } = yield* askEventDocResolveStore();

  const events = yield* askEventDocEventListAll(docId);

  const functionsCaller = createDynamicFunctionCaller<EventDocInvokableFunctions>(eventDocFunctionsName(storeName, type));
  const collected = yield* askCatch(functionsCaller.collectReferences(events));

  if (!collected.success) {
    if (isEventDocFunctionsMissing(collected.error.errorType)) {
      return [];
    }

    return yield* askThrowError(collected.error.errorType, collected.error.errorText);
  }

  return collected.result;
}
