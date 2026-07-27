import { EventDocDocRef } from '../../models';
import type { EventDocExportUiState } from '../types/EventDocExportUiState';

// The ticked docs as transfer refs. Derived from the candidates rather than tracked separately, so a
// tick can never outlive the document it pointed at. `service` comes from the caller, since the
// candidate summaries carry the collection `type` but not the service they were fetched from.
export const createEventDocExportSelectedRefs =
  (serviceName: string) =>
  (state: EventDocExportUiState): EventDocDocRef[] =>
    state.candidates
      .filter((candidate) => state.selectedIds.includes(candidate.id))
      .map((candidate) => ({ service: serviceName, type: candidate.type, id: candidate.id }));
