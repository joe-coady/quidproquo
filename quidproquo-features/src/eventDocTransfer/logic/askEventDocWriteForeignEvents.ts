import { askInlineFunctionExecute, AskResponse, Nullable } from 'quidproquo-core';

import { askEventDocResolveStore } from '../../eventDoc/context';
import { askEventDocEventWrite, askEventDocUpsert } from '../../eventDoc/data';
import {
  EventDocEffect,
  EventDocEvent,
  EventDocOnAppendInput,
  EventDocOnPublishInput,
  EventDocSummary,
  eventDocSummarySchema,
} from '../../eventDoc/models';
import { foldEventDocSummary } from '../../eventDoc/summary';
import { askValidateModelOrThrowError } from '../../validation/askValidateModelOrThrowError';

// The last Publish in a log, if any: what onPublish is fired for once the whole log has landed.
const findLatestPublishEvent = (events: EventDocEvent[]): Nullable<EventDocEvent> =>
  [...events].reverse().find((event) => event.type === EventDocEffect.Publish) ?? null;

// Fire the collection's post-append hooks ONCE for the doc, not once per imported event: per-event
// firing would replay every historical publish and (for onAppend) spam the target's websockets.
// Both hooks are contractually idempotent, and this is the shape a resumed import repeats safely.
function* askEventDocFireImportHooks(docId: string, events: EventDocEvent[], summary: EventDocSummary): AskResponse<void> {
  const { onPublish, onAppend } = yield* askEventDocResolveStore();

  const tailEvent = events[events.length - 1];

  if (!tailEvent || (!onPublish && !onAppend)) {
    return;
  }

  const publishEvent = findLatestPublishEvent(events);

  if (onPublish && publishEvent) {
    yield* askInlineFunctionExecute<void, EventDocOnPublishInput>(onPublish, { docId, event: publishEvent, summary, events });
  }

  if (onAppend) {
    yield* askInlineFunctionExecute<void, EventDocOnAppendInput>(onAppend, { docId, event: tailEvent, summary, events });
  }
}

/**
 * Write foreign events into this collection's log VERBATIM: original index, createdAt, createdBy
 * and clientMessageId all preserved, so the target's history is byte-identical to the source's and
 * a later comparison can still recognise it.
 *
 * This deliberately does NOT go through askEventDocEventAppend, which restamps metadata and runs
 * the collection's validator. Replayed history was already validated at its origin, and a
 * validator that has since become stricter must not be able to rewrite the past.
 *
 * `events` is the doc's COMPLETE incoming log and `fromIndex` the first event not already present,
 * so the summary is rebuilt by folding the whole thing rather than patched incrementally. The
 * writes are conditional on (docId, index) in the store, which is what makes a partial import safe
 * to re-run.
 */
export function* askEventDocWriteForeignEvents(docId: string, events: EventDocEvent[], fromIndex: number, logRewritten = false): AskResponse<number> {
  const { type } = yield* askEventDocResolveStore();

  const missing = events.slice(fromIndex);

  for (const event of missing) {
    yield* askEventDocEventWrite(docId, event);
  }

  const summary = foldEventDocSummary(type, events);
  yield* askValidateModelOrThrowError(summary, eventDocSummarySchema);
  yield* askEventDocUpsert(summary);

  // `logRewritten` covers the forced-overwrite case where the tail was DISCARDED and nothing new
  // needed writing: the summary still changed, so a materialized read model is still stale.
  if (missing.length > 0 || logRewritten) {
    yield* askEventDocFireImportHooks(docId, events, summary);
  }

  return missing.length;
}
