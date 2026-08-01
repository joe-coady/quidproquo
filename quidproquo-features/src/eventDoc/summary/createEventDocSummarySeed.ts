import { EventDocSummaryView } from '../models';

// Where the summary view starts. INIT_STATE overlays the real identity, so like
// createEventDocInitialDocumentState these placeholders only surface before INIT is folded
// (which a real log always opens with).
//
// No `type`: that is the summary store's partition key, stamped where the view is
// persisted, not folded from any event.
export const createEventDocSummarySeed = (): EventDocSummaryView => ({
  id: 'NO_INIT',
  code: 'NO_INIT',
  name: 'NO_INIT',
  createdAt: '1970-01-01T00:00:00.000Z',
  updatedAt: '1970-01-01T00:00:00.000Z',
  createdBy: 'NO_INIT',
  updatedBy: 'NO_INIT',
  versions: [],
});
