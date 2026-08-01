import { AskResponse } from 'quidproquo-core';

import { askEventDocEventListAll, askEventDocGetById } from '../../eventDoc/data';
import { askEventDocGetIdByCode } from '../../eventDoc/logic';
import { foldEventDocSummary } from '../../eventDoc/summary';
import { EventDocBundleDoc, EventDocTransferPlanRow, EventDocTransferStatus } from '../models';
import { findEventDocLogDivergence } from './findEventDocLogDivergence';

// A row with the counts and identity filled in; the status and reason are decided below.
const toPlanRow = (
  doc: EventDocBundleDoc,
  code: string,
  name: string,
  existingEvents: number,
  status: EventDocTransferStatus,
  detail?: string,
): EventDocTransferPlanRow => ({
  service: doc.service,
  type: doc.type,
  id: doc.id,
  code,
  name,
  status,
  incomingEvents: doc.events.length,
  existingEvents,
  eventsWritten: 0,
  assetsWritten: 0,
  discardedEvents: 0,
  detail,
});

/**
 * What an import of ONE doc would do, deciding nothing and writing nothing. Runs inside the doc's
 * collection store.
 *
 * Identity comes from folding the INCOMING log rather than from the bundle, which is why no summary
 * has to travel. The code check runs before the log comparison, and for every doc rather than only
 * new ones: a collision breaks `askEventDocGetByCode` for BOTH docs (it throws on more than one
 * match) even when the two logs agree perfectly.
 */
export function* askEventDocBundlePlanDoc(doc: EventDocBundleDoc): AskResponse<EventDocTransferPlanRow> {
  const { code, name } = foldEventDocSummary(doc.events);

  // Defensive: an export never emits an empty log (every doc opens with INIT_STATE), so this only
  // fires for a hand-edited bundle. Nothing to write and nothing to compare against.
  if (doc.events.length === 0) {
    return toPlanRow(doc, code, name, 0, EventDocTransferStatus.Ignored, 'The bundle carries no events for this doc.');
  }

  // Checked for EVERY doc, not just new ones: a fast-forward can carry a SET_CODE that renames this
  // doc onto a code a sibling already holds, which lands two docs on one code just as surely as
  // importing a new doc would. Scoped to this collection and this tenant, since that is all
  // askEventDocGetByCode ever looks at.
  const codeOwnerId = yield* askEventDocGetIdByCode(code);

  if (codeOwnerId && codeOwnerId !== doc.id) {
    return toPlanRow(doc, code, name, 0, EventDocTransferStatus.CodeConflict, `Code '${code}' is already used by doc ${codeOwnerId}.`);
  }

  const existing = yield* askEventDocGetById(doc.id);

  if (!existing) {
    return toPlanRow(doc, code, name, 0, EventDocTransferStatus.New);
  }

  const existingEvents = yield* askEventDocEventListAll(doc.id);
  const comparison = findEventDocLogDivergence(existingEvents, doc.events);

  if (comparison.diverged) {
    return toPlanRow(
      doc,
      code,
      name,
      existingEvents.length,
      EventDocTransferStatus.Diverged,
      `Logs disagree at event ${comparison.atIndex}: the target was edited directly.`,
    );
  }

  if (comparison.existingAhead) {
    return toPlanRow(
      doc,
      code,
      name,
      existingEvents.length,
      EventDocTransferStatus.Diverged,
      `The target is ahead by ${existingEvents.length - doc.events.length} event(s): the bundle is older than what is already here.`,
    );
  }

  if (comparison.sharedCount === doc.events.length) {
    return toPlanRow(doc, code, name, existingEvents.length, EventDocTransferStatus.Same);
  }

  return toPlanRow(doc, code, name, existingEvents.length, EventDocTransferStatus.FastForward);
}
