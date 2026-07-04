import { Nullable, QpqIsoDateTime } from 'quidproquo-core';

import { EventDocSummary, EventDocVersion } from '../../models';
import { maxByVersion } from './maxByVersion';

/**
 * Highest version published at or before `clock` (as-of-clock time-travel: pass
 * a version's own `publishedAt` to render it as-was, or `now` for latest).
 * ISO-8601 timestamps compare correctly as strings.
 */
export const publishedAsOf = (model: EventDocSummary, clock: QpqIsoDateTime): Nullable<EventDocVersion> =>
  maxByVersion(model.versions.filter((version) => version.publishedAt !== undefined && version.publishedAt <= clock));
