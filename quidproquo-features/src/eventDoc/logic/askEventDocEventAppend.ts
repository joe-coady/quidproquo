import {
  askDateNow,
  askInlineFunctionExecute,
  AskResponse,
  askRetry,
  askThrowError,
  ErrorTypeEnum,
  KeyValueStoreUpsertErrorTypeEnum,
} from 'quidproquo-core';
import { Nullable } from 'quidproquo-core';

import { askValidateModelOrThrowError } from '../../validation/askValidateModelOrThrowError';
import { askEventDocStoreRead } from '../context/askEventDocStoreRead';
import { askEventDocEventLast } from '../data/askEventDocEventLast';
import { askEventDocEventListAll } from '../data/askEventDocEventListAll';
import { askEventDocEventWrite } from '../data/askEventDocEventWrite';
import { askEventDocUpsert } from '../data/askEventDocUpsert';
import {
  EventDocEffect,
  EventDocEvent,
  EventDocEventActor,
  EventDocEventInput,
  EventDocEventValidationInput,
  EventDocOnPublishInput,
  eventDocSummarySchema,
} from '../models';
import { applyEventDocSummaryEvent } from '../summary';
import { defaultEventDocEventValidator } from '../validation';
import { askEventDocGetByIdOrThrow } from './askEventDocGetByIdOrThrow';

// Optimistic-concurrency bound: how many times a losing writer re-reads the
// tail and retries before giving up. With linear backoff + jitter between laps
// this absorbs a burst of ~a dozen simultaneous writers; more sustained
// contention than that means something is systematically hammering the doc —
// fail rather than spin.
const MAX_APPEND_ATTEMPTS = 8;
const APPEND_RETRY_BASE_WAIT_MS = 50;
const APPEND_RETRY_MAX_JITTER_MS = 100;

/**
 * Append a client event to a model's log; the safety invariants live here:
 * - Dedup: a retry re-sends its `clientMessageId`; if the latest event already
 *   has it, return that unchanged. Best-effort (latest only) until a GSI exists.
 * - Version monotonicity: a vN event must not land after a v(N+1) event.
 * - Lifecycle/payload: if the collection configures an `eventValidator` inline
 *   function, the event is checked against the document folded from the prior log
 *   (the same rule the editor runs client-side) and rejected before it is written.
 * - Concurrency: the write CLAIMS the (modelId, index) slot conditionally
 *   (ifNotExists), so a losing concurrent writer gets the namespaced Upsert
 *   Conflict — the ONLY error askRetry re-laps on, which is why it's distinct
 *   from the domain-level ErrorTypeEnum.Conflict (version/validation), those
 *   stay terminal. Each lap re-reads the tail, so dedup and validation re-run
 *   against fresh state and concurrent appends serialize onto consecutive
 *   indexes instead of overwriting each other.
 * A deduped retry returns early and is neither validated nor re-derived.
 */
export function* askEventDocEventAppend(modelId: string, input: EventDocEventInput, actor: EventDocEventActor): AskResponse<EventDocEvent> {
  const { metadata } = input.payload;

  const result = yield* askRetry(
    function* askAppendLap(): AskResponse<EventDocEvent> {
      const last = yield* askEventDocEventLast(modelId);

      if (!last) {
        return yield* askThrowError(ErrorTypeEnum.NotFound, `No event log for model ${modelId} — it has no INIT_STATE.`);
      }

      if (metadata.clientMessageId && last.payload.metadata.clientMessageId === metadata.clientMessageId) {
        return last;
      }

      if (metadata.version < last.payload.metadata.version) {
        return yield* askThrowError(
          ErrorTypeEnum.Conflict,
          `Event version ${metadata.version} is older than the last event version ${last.payload.metadata.version}.`,
        );
      }

      const now = yield* askDateNow();

      const event: EventDocEvent = {
        type: input.type,
        payload: {
          data: input.payload.data,
          metadata: {
            version: metadata.version,
            clientMessageId: metadata.clientMessageId,
            createdBy: actor,
            createdAt: now,
            index: last.payload.metadata.index + 1,
          },
        },
      };

      // Append-time validation, always run against the prior log: reject a forbidden event
      // (e.g. editing while published) before it ever reaches the store. A collection with
      // domain rules supplies an `eventValidator` inline function — a COMPLETE validator that
      // already composes the reserved lifecycle guard (via `createEventDocEventValidator`), so
      // it can also relax it where needed (e.g. secrets rotate on a published client). A
      // collection without one falls back to `defaultEventDocEventValidator` — the same guard
      // with no domain rules — so nothing is silently editable after publish just because it
      // wired no validator. Either way exactly one validator runs (not both): the default must
      // not run alongside a supplied one, or it would re-impose rules the supplied one relaxed.
      const { eventValidator } = yield* askEventDocStoreRead();
      const events = yield* askEventDocEventListAll(modelId);
      const reason = eventValidator
        ? yield* askInlineFunctionExecute<Nullable<string>, EventDocEventValidationInput>(eventValidator, { event, events })
        : defaultEventDocEventValidator(event, events);

      if (reason) {
        return yield* askThrowError(ErrorTypeEnum.Conflict, reason);
      }

      yield* askEventDocEventWrite(modelId, event);

      // Re-derive the record (the queryable view) from its prior state + this event, so
      // versions/status/name/updatedAt stay in sync with the log — the same record reducer
      // create uses, applied incrementally here.
      const current = yield* askEventDocGetByIdOrThrow(modelId);
      const record = applyEventDocSummaryEvent(current, event);
      yield* askValidateModelOrThrowError(record, eventDocSummarySchema);
      yield* askEventDocUpsert(record);

      return event;
    },
    MAX_APPEND_ATTEMPTS,
    APPEND_RETRY_BASE_WAIT_MS,
    [KeyValueStoreUpsertErrorTypeEnum.Conflict],
    { linearBackoff: true, maxJitterMs: APPEND_RETRY_MAX_JITTER_MS },
  );

  if (!result.success) {
    if (result.error.errorType === KeyValueStoreUpsertErrorTypeEnum.Conflict) {
      return yield* askThrowError(
        ErrorTypeEnum.Conflict,
        `Could not append to model ${modelId}: lost the index race ${MAX_APPEND_ATTEMPTS} times — too much concurrent write contention.`,
      );
    }

    return yield* askThrowError(result.error.errorType as ErrorTypeEnum, result.error.errorText, result.error.errorStack);
  }

  // The on-publish hook runs AFTER the retry block, never inside a lap: the
  // hook may itself throw the namespaced Upsert Conflict (e.g. a materialized
  // read-model write), which inside a lap would re-run the whole append. At
  // this point the event is durably written and the summary persisted; a hook
  // failure propagates so the caller knows the side effect (not the append)
  // failed. A deduped publish retry also reaches here and re-fires the hook -
  // deliberate: hooks must be idempotent, and a retry after a failed hook is
  // exactly how a stale read model gets repaired.
  const { onPublish } = yield* askEventDocStoreRead();
  if (onPublish && result.result.type === EventDocEffect.Publish) {
    const summary = yield* askEventDocGetByIdOrThrow(modelId);
    yield* askInlineFunctionExecute<void, EventDocOnPublishInput>(onPublish, {
      docId: modelId,
      event: result.result,
      summary,
    });
  }

  return result.result;
}
