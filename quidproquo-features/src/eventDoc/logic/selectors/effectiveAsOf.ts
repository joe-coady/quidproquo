import { Nullable, QpqIsoDateTime } from 'quidproquo-core';

import { EventDocSummary, EventDocVersion } from '../../models';
import { maxByVersion } from './maxByVersion';

/**
 * The highest version whose publish is effective at or before `clock` — the version a
 * "published, as of now" render resolves to. Unlike `publishedAsOf` (keyed on
 * `publishedAt`, when the publish happened), this keys on `effectiveFrom` (when the publish
 * takes effect), so a publish scheduled for the future stays invisible until its effective
 * time. Returns null when nothing is yet effective. ISO-8601 timestamps compare as strings.
 */
export const effectiveAsOf = (
  model: EventDocSummary,
  clock: QpqIsoDateTime
): Nullable<EventDocVersion> =>
  maxByVersion(
    model.versions.filter(
      (version) =>
        version.effectiveFrom !== undefined && version.effectiveFrom <= clock
    )
  );
