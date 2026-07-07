import { Nullable } from 'quidproquo-core';

import { EventDocListItem } from './EventDocListItem';
import { EventDocSummary } from './EventDocSummary';
import { EventDocVersion } from './EventDocVersion';

// The tail (highest-version) pointer, or null for an item with no versions.
// Kept local so this stays a pure, frontend-safe @exengne/models helper (the
// service-utils selectors carry the same notion for the backend).
const latestVersion = (versions: EventDocVersion[]): Nullable<EventDocVersion> =>
  versions.reduce<Nullable<EventDocVersion>>((max, version) => (!max || version.version > max.version ? version : max), null);

/** Flatten a event-doc model into a display-ready list row. */
export const toEventDocListItem = (model: EventDocSummary): EventDocListItem => {
  const latest = latestVersion(model.versions);

  return {
    id: model.id,
    name: model.name,
    version: latest?.version ?? null,
    hasDraft: latest ? latest.publishedAt === undefined : false,
    updatedAt: model.updatedAt,
    updatedBy: model.updatedBy,
    createdAt: model.createdAt,
    createdBy: model.createdBy,
  };
};
