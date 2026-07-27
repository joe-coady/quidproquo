import { EventDocDocRef } from './EventDocDocRef';

// One doc discovered by the manifest walk: its coordinates plus enough identity to show the
// operator what they are about to export. `depth` is 0 for the doc the walk started from and the
// shortest link distance for everything else, so the walk's reverse order is leaves-first.
// `deleted` docs are reported but never bundled: `deletedAt` lives on the summary, not the log, so
// an events-only bundle would silently resurrect them in the target.
export type EventDocManifestItem = EventDocDocRef & {
  code: string;
  name: string;
  depth: number;
  deleted: boolean;
};
