import { EventDocEventValidator } from '../types/EventDocEventValidator';

// A deleted document accepts nothing but RESTORE. Composed into the '*' fallback and onto
// DELETE itself, so deleting twice is rejected rather than recorded.
export const requireNotDeleted: EventDocEventValidator = (_event, state) =>
  state.deletedAt === undefined ? null : 'The document is deleted — restore it first.';
