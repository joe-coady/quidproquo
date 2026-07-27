import { EventDocTransferStatus } from '../../models';

/**
 * Operator-facing wording for each import status, so every app says the same thing rather than each
 * inventing its own phrasing for "diverged". Plain words rather than the enum's camelCase: this table
 * is the last thing standing between someone and a write, so it has to read like a sentence.
 *
 * Lives in the feature (not the view) for the same reason the stories' `detail` strings do - the
 * words are part of what the transfer MEANS, while how they are laid out is the app's business.
 */
export const EVENT_DOC_TRANSFER_STATUS_LABELS: Record<EventDocTransferStatus, string> = {
  [EventDocTransferStatus.New]: 'New',
  [EventDocTransferStatus.FastForward]: 'Update',
  [EventDocTransferStatus.Same]: 'Already up to date',
  [EventDocTransferStatus.Diverged]: 'Blocked: changed here',
  [EventDocTransferStatus.CodeConflict]: 'Blocked: code in use',
  [EventDocTransferStatus.Overwritten]: 'Overwritten',
  [EventDocTransferStatus.Ignored]: 'Skipped',
};
