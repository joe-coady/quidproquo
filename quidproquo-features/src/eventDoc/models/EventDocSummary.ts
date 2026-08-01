import { z } from 'zod';

import { DateISOSchema } from './DateISOSchema';
import { eventDocVersionSchema } from './EventDocVersion';

/**
 * THE summary view: what folding a log's identity/lifecycle events produces.
 *
 * Every field here is DERIVED from the event log — the summary holds no authoritative
 * state of its own, so it can be dropped and rebuilt at any time, which is what makes many
 * views per document possible. `versions` tracks the publish history;
 * `createdAt`/`createdBy` are write-once, every event refreshes `updatedAt`/`updatedBy`,
 * and deletion is soft via `deletedAt`.
 *
 * Note what is NOT here: `type`. The doc type ('flow', 'template') is the summary STORE's
 * partition key, not something any event carries or any reducer derives — it is stamped
 * where the view is persisted. Keeping it out is what lets this view fold with the same
 * `fold(events)` signature as every other view, and lets EVERY event doc have a summary
 * without declaring one.
 */
export const eventDocSummaryViewSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  createdAt: DateISOSchema,
  updatedAt: DateISOSchema,
  deletedAt: DateISOSchema.optional(),
  createdBy: z.string(),
  updatedBy: z.string(),
  versions: z.array(eventDocVersionSchema),
});

export type EventDocSummaryView = z.infer<typeof eventDocSummaryViewSchema>;

/**
 * The summary view as STORED (`PK=type, SK=id`) — the queryable record.
 *
 * The view plus the one field the store needs to partition by. Reads hand this back;
 * writes stamp `type` from the collection the document belongs to.
 */
export const eventDocSummarySchema = eventDocSummaryViewSchema.extend({
  type: z.string(),
});

export type EventDocSummary = z.infer<typeof eventDocSummarySchema>;
