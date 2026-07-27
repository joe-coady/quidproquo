import { EventDocManifestItem } from './EventDocManifestItem';

// What POST /transfer/export hands the browser: a short-lived link to the staged bundle plus
// the manifest it contains, so the UI can show exactly what was included after the fact.
export type EventDocTransferExportResult = {
  downloadUrl: string;
  filename: string;
  items: EventDocManifestItem[];
};
