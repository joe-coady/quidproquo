import { EventDocManifestItem } from '../../models';
import type { EventDocExportUiState } from '../types/EventDocExportUiState';

// The docs the operator actually picked (depth 0), as opposed to everything the walk dragged in
// behind them. Shown separately so a multi-doc export reads as "these 3, plus what they need".
export const selectEventDocExportRoots = (state: EventDocExportUiState): EventDocManifestItem[] => state.items.filter((item) => item.depth === 0);
