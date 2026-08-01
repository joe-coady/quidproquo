import { EventDocEvent, EventDocSummaryView } from '../models';
import { applyEventDocSummaryEvent } from './applyEventDocSummaryEvent';
import { createEventDocSummarySeed } from './createEventDocSummarySeed';

// Reduce a log into the summary view (from-scratch derivation). The append handler applies
// incrementally instead; this is for create / re-derivation.
//
// `fold(events)` and nothing else — the same signature every view has. It used to take the
// doc `type` as well, which was the tell that `type` was never part of this view: no reducer
// derives it, it is the summary store's partition key and belongs to persistence.
//
// Callers should pass the ACCEPTED events — what the document view let in — not the raw log.
// createEventDocDefinition's built-in `views.summary` does that for them.
export const foldEventDocSummary = (events: EventDocEvent[]): EventDocSummaryView =>
  events.reduce(applyEventDocSummaryEvent, createEventDocSummarySeed());
