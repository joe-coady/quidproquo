import { EventDocDocument } from '../../models';
import { EventDocBaseViewVersion } from './EventDocBaseViewVersion';
import { EventDocNextViewVersion } from './EventDocNextViewVersion';

// One revision of a doc type: every view of the doc, as that view existed at this version.
//
// The version index is the DOC TYPE's revision counter, not any one artifact's — it is
// bumped when the events change OR when any view's shape changes, because both alter how
// a log folds. It is stamped on every event the doc authors, and the fold routes on it.
//
// A version's `views` map must name EVERY view the doc type has. That is what makes a
// forgotten view a crash rather than a view that quietly stops folding.
export type EventDocBaseVersion<TViews extends Record<string, EventDocDocument> = Record<string, EventDocDocument>> = {
  version: number;
  views: { [K in keyof TViews]: EventDocBaseViewVersion<TViews[K]> };
};

export type EventDocNextVersion<TViews extends Record<string, EventDocDocument> = Record<string, EventDocDocument>> = {
  version: number;
  views: { [K in keyof TViews]: EventDocNextViewVersion<TViews[K]> };
};

// The full history of a doc type, oldest first. The head is the base (seeds, no
// predecessor); every tail entry migrates from the one before it. The tuple shape is
// what stops a base version declaring a migration or a later version declaring a seed.
//
// Contiguity (1..schemaVersion, no gaps, no repeats) and view-set consistency across
// versions are RUNTIME guards checked at definition time, not type guards — the same
// trade migrationChain already makes. They throw where they are cheapest to diagnose:
// at module load, not mid-fold on someone's document.
export type EventDocVersions = [EventDocBaseVersion, ...EventDocNextVersion[]];
