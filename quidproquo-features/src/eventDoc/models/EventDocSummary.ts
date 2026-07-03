import { z } from 'zod';

import { DateISOSchema } from './DateISOSchema';
import { eventDocVersionSchema } from './EventDocVersion';

/**
 * A versioned JSON document (`PK=type, SK=id`) — the queryable record, derived by
 * folding the event log's identity/lifecycle events (the document content is folded
 * separately on the client). `versions` tracks the publish history.
 *
 * `createdAt`/`createdBy` are write-once; every event refreshes `updatedAt`/`updatedBy`.
 * Deletion is soft, via `deletedAt`.
 */
export const eventDocSummarySchema = z.object({
  type: z.string(),
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

export type EventDocSummary = z.infer<typeof eventDocSummarySchema>;
