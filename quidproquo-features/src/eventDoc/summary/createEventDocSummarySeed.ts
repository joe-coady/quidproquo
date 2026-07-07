import { EventDocSummary } from '../models';

// Empty record carrying only the store `type`; INIT_STATE overlays the real identity.
// Like createEventDocInitialDocumentState, the placeholders only surface before
// INIT is folded (which a real log always opens with).
export const createEventDocSummarySeed = (type: string): EventDocSummary => ({
  type,
  id: 'NO_INIT',
  code: 'NO_INIT',
  name: 'NO_INIT',
  createdAt: '1970-01-01T00:00:00.000Z',
  updatedAt: '1970-01-01T00:00:00.000Z',
  createdBy: 'NO_INIT',
  updatedBy: 'NO_INIT',
  versions: [],
});
