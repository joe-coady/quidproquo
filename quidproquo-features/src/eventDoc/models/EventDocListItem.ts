import { QpqIsoDateTime } from 'quidproquo-core';
import { Nullable } from 'quidproquo-core';

/**
 * A flattened, display-ready view of a {@link EventDocSummary} for a list /
 * table row. Derives the version + draft state from the model's inline
 * `versions` so consumers don't have to reach into the version array.
 */
export type EventDocListItem = {
  id: string;
  name: string;
  /** The highest version number, or null when the item has no versions yet. */
  version: Nullable<number>;
  /** True when the latest version is an unpublished draft. */
  hasDraft: boolean;
  updatedAt: QpqIsoDateTime;
  updatedBy: string;
  createdAt: QpqIsoDateTime;
  createdBy: string;
};
