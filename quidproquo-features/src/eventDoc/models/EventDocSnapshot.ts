/**
 * One stored snapshot: a single view's folded state at a single event, as the snapshot
 * store's row data.
 *
 * The state is ERA-PINNED — folded by foldEventDocLogAsWritten to the schema version its
 * log prefix actually reached, never climbed to whatever the code's latest was when the
 * snapshot was written. That makes a snapshot an immutable fact of the log (refolding the
 * same prefix reproduces it byte-for-byte, deploys notwithstanding) and a correct seed for
 * resuming the fold; a reader wanting latest shape migrates it up, exactly as the read
 * side does for any stored accumulator.
 *
 * The inline/storageDrive split exists because a folded state has no size bound and a KVS
 * row does (DynamoDB's 400KB item ceiling): a state small enough to inline is carried on
 * the row, anything bigger lives on the collection's blob drive at the conventional
 * snapshot path (see eventDocSnapshotPath) and the row records only that it is there —
 * the path is derived from the row's own keys, so it is not repeated here.
 */
export type EventDocSnapshot =
  | {
      type: 'inline';
      /** The view's folded state at this event. */
      snapshot: unknown;
    }
  | {
      type: 'storageDrive';
    };
