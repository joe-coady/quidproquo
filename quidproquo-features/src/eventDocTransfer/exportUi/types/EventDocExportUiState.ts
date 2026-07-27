import { Nullable } from 'quidproquo-core';

import { EventDocSummary } from '../../../eventDoc/models';
import { EventDocManifestItem, EventDocTransferExportResult } from '../../models';

/**
 * The export dialog, which owns the whole flow: pick documents, see what they drag along, download.
 *
 * Two phases, derived rather than stored: `items` empty means still PICKING, `items` populated means
 * PREVIEWING (a manifest always contains at least the picked docs, so there is no ambiguous empty
 * result). Selection lives here rather than on the host list screen, so nothing has to survive that
 * screen's paging or refresh, and the dialog drops into any host with no selection plumbing.
 */
export type EventDocExportUiState = {
  isOpen: boolean;
  // Everything in the collection that COULD be exported, as loaded when the dialog opened.
  candidates: EventDocSummary[];
  selectedIds: string[];
  // The manifest of the picked docs. Empty until the operator moves to the preview.
  items: EventDocManifestItem[];
  isLoading: boolean;
  isExporting: boolean;
  error: Nullable<string>;
  result: Nullable<EventDocTransferExportResult>;
};

export const createInitialEventDocExportUiState = (): EventDocExportUiState => ({
  isOpen: false,
  candidates: [],
  selectedIds: [],
  items: [],
  isLoading: false,
  isExporting: false,
  error: null,
  result: null,
});
