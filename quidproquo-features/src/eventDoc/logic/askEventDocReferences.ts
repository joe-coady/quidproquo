import { askInlineFunctionExecute, AskResponse } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { askEventDocEventListAll } from '../data/askEventDocEventListAll';
import { EventDocLink, EventDocReferencesInput } from '../models';

/**
 * Every doc this one depends on, ONE hop out: hand the collection's `referenceResolver` inline
 * function the whole log and let it walk it (see collectEventDocReferences - it collects at every
 * step, migrated to the latest shape, so a link that existed only in an older version is still
 * found). A collection with no resolver configured is a leaf and returns [] without reading
 * anything.
 *
 * The recursive walk over these edges lives in the transfer feature (askEventDocManifest), which is
 * the layer that knows every collection.
 */
export function* askEventDocReferences(docId: string): AskResponse<EventDocLink[]> {
  const { referenceResolver } = yield* askEventDocResolveStore();

  if (!referenceResolver) {
    return [];
  }

  const events = yield* askEventDocEventListAll(docId);

  return yield* askInlineFunctionExecute<EventDocLink[], EventDocReferencesInput>(referenceResolver, { events, docId });
}
