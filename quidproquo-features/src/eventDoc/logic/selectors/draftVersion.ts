import { Nullable } from 'quidproquo-core';

import { EventDocSummary, EventDocVersion } from '../../models';
import { latestVersion } from './latestVersion';

/**
 * Invariant: a draft is always the tail (highest) version with no
 * `publishedAt` — so checking the latest version is enough.
 */
export const draftVersion = (
  model: EventDocSummary
): Nullable<EventDocVersion> => {
  const latest = latestVersion(model);
  return latest && latest.publishedAt === undefined ? latest : null;
};
