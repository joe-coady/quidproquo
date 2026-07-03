import { EventDocEvent, EventDocSummary } from '../models';
import { applyEventDocSummaryEvent } from './applyEventDocSummaryEvent';
import { createEventDocSummarySeed } from './createEventDocSummarySeed';

// Reduce a full event log into the queryable record (from-scratch derivation). The
// append handler applies incrementally instead; this is for create / re-derivation.
export const foldEventDocSummary = (
  type: string,
  events: EventDocEvent[]
): EventDocSummary =>
  events.reduce(applyEventDocSummaryEvent, createEventDocSummarySeed(type));
