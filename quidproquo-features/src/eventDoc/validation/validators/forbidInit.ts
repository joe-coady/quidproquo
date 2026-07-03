import { EventDocEventValidator } from '../types/EventDocEventValidator';

// INIT_STATE opens a brand-new log at create time; it must never be appended to a
// document that already exists.
export const forbidInit: EventDocEventValidator = () =>
  'Cannot re-initialise an existing document.';
