import { EventDocManifestItem } from './EventDocManifestItem';

// The manifest as the export dialog shows it: one group per doc type ("content: a, b, c").
// `type` is the raw collection type; the view maps it to a display label.
export type EventDocManifestGroup = {
  type: string;
  items: EventDocManifestItem[];
};
